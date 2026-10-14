import { NextResponse } from 'next/server'
import { getSessionUser, checkOrderRateLimit, addOrder, getUserOrders, getOrders } from '@/lib/auth-server'
import { mockBooks, coupons } from '@/lib/data'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view your orders.' },
        { status: 401 }
      )
    }

    if (user.role === 'admin') {
      const allOrders = getOrders()
      return NextResponse.json({ success: true, orders: allOrders })
    }

    const userOrders = getUserOrders(user.id)
    return NextResponse.json({ success: true, orders: userOrders })
  } catch (err) {
    console.error('Error fetching orders:', err)
    return NextResponse.json({ error: 'Failed to retrieve orders.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // 1. Strictly enforce valid session
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to place an order.' },
        { status: 401 }
      )
    }

    // 2. Rate limiting check
    if (!checkOrderRateLimit(user.id, 10)) {
      return NextResponse.json(
        { error: 'Too many order requests. Please wait a moment before trying again.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { items, shippingAddress, shippingMethod = 'standard', paymentMethod = 'cod', couponCode, transactionId } = body

    // 3. Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    // 4. Validate shipping address in Nepal
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return NextResponse.json({ error: 'Delivery address is required.' }, { status: 400 })
    }

    const { name, phone, line1, line2, city, district, province, postalCode, notes } = shippingAddress
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Recipient full name is required.' }, { status: 400 })
    }

    const cleanPhone = (phone || '').replace(/\s+/g, '')
    // Accept Nepal phone numbers: 98XXXXXXXX, 97XXXXXXXX, or +977-98XXXXXXXX
    const isNepalPhone = /^(?:\+?977[-_]?)?9[78]\d{8}$/.test(cleanPhone)
    if (!isNepalPhone) {
      return NextResponse.json(
        { error: 'A valid Nepal mobile number is required (e.g. 98XXXXXXXX or +977-98XXXXXXXX).' },
        { status: 400 }
      )
    }

    if (!line1?.trim()) {
      return NextResponse.json({ error: 'Street address / Tole is required.' }, { status: 400 })
    }
    if (!city?.trim()) {
      return NextResponse.json({ error: 'City / Municipality is required.' }, { status: 400 })
    }
    if (!district?.trim()) {
      return NextResponse.json({ error: 'District is required.' }, { status: 400 })
    }
    if (!province?.trim()) {
      return NextResponse.json({ error: 'Province is required.' }, { status: 400 })
    }

    // 5. Server-side price recalculation & stock validation from mockBooks
    let subtotal = 0
    const verifiedItems: { bookId: string; quantity: number; price: number; format?: string }[] = []

    for (const item of items) {
      const book = mockBooks.find(b => b.id === item.bookId || b.slug === item.bookId)
      if (!book) {
        return NextResponse.json({ error: `Book not found: ${item.bookId}` }, { status: 400 })
      }

      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
      if (book.stock < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${book.title}". Available: ${book.stock}` },
          { status: 400 }
        )
      }

      // Use strictly the server catalog price - ignore any price from the client
      const verifiedUnitPrice = book.price
      subtotal += verifiedUnitPrice * quantity
      verifiedItems.push({
        bookId: book.id,
        quantity,
        price: verifiedUnitPrice,
        format: item.format || 'Paperback',
      })
    }

    // Shipping calculation
    let shipping = shippingMethod === 'express' ? 200 : shippingMethod === 'sameday' ? 300 : 100
    if (shippingMethod === 'standard' && subtotal >= 1000) {
      shipping = 0 // Free standard shipping on orders Rs. 1000+
    }

    // Discount calculation
    let discount = 0
    if (couponCode) {
      const foundCoupon = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive)
      if (foundCoupon && subtotal >= foundCoupon.minOrder) {
        if (foundCoupon.type === 'percentage') {
          discount = Math.round((subtotal * foundCoupon.discount) / 100)
          if (foundCoupon.maxDiscount && discount > foundCoupon.maxDiscount) {
            discount = foundCoupon.maxDiscount
          }
        } else {
          discount = foundCoupon.discount
        }
      }
    }

    // COD surcharge
    const codFee = paymentMethod === 'cod' ? 50 : 0
    const total = Math.max(0, subtotal + shipping - discount + codFee)

    // Build verified Order record
    const now = new Date()
    const orderId = `Yetaxahai-${now.getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`
    const deliveryDays = shippingMethod === 'express' ? 3 : shippingMethod === 'sameday' ? 0 : 7
    const estimatedDelivery = new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000)

    let finalTransactionId = transactionId
    if (paymentMethod === 'esewa' && !finalTransactionId) {
      finalTransactionId = `TXN-ESW-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    } else if (paymentMethod === 'khalti' && !finalTransactionId) {
      finalTransactionId = `KHL-TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${now.getFullYear()}`
    }

    const newOrder = {
      id: orderId,
      userId: user.id, // Strictly from session, never trusted from client
      items: verifiedItems,
      subtotal,
      shipping,
      discount,
      total,
      status: 'confirmed' as const,
      paymentMethod: paymentMethod as 'esewa' | 'khalti' | 'cod',
      paymentStatus: paymentMethod === 'cod' ? ('pending' as const) : ('paid' as const),
      transactionId: finalTransactionId,
      paymentDate: paymentMethod !== 'cod' ? now.toISOString() : undefined,
      shippingAddress: {
        name: name.trim(),
        phone: cleanPhone,
        line1: line1.trim(),
        line2: line2?.trim() || undefined,
        city: city.trim(),
        district: district.trim(),
        province: province.trim(),
        postalCode: postalCode?.trim() || '44600',
        notes: notes?.trim() || undefined,
      },
      shippingMethod: shippingMethod as 'standard' | 'express' | 'sameday',
      createdAt: now.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString().slice(0, 10),
    }

    addOrder(newOrder)

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 })
  } catch (err) {
    console.error('Order creation error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred while placing your order.' }, { status: 500 })
  }
}
