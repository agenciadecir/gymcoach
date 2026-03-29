import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionFromCookie } from '@/lib/session'

const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// GET - Obtener estadísticas de ingresos mensuales
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user || user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Solo el entrenador puede ver estadísticas' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    
    const currentYear = new Date().getFullYear()
    const year = yearParam ? parseInt(yearParam) : currentYear
    
    // Obtener todos los pagos del año
    const payments = await db.payment.findMany({
      where: { year },
      include: {
        student: { select: { id: true, name: true, email: true } }
      }
    })
    
    // Calcular ingresos por mes
    const monthlyData = []
    for (let month = 1; month <= 12; month++) {
      const monthPayments = payments.filter(p => p.month === month)
      const totalIncome = monthPayments
        .filter(p => p.status === 'paid' || p.isGifted)
        .reduce((sum, p) => sum + (p.isGifted ? 0 : p.amount), 0)
      
      const giftedCount = monthPayments.filter(p => p.isGifted).length
      const paidCount = monthPayments.filter(p => p.status === 'paid' && !p.isGifted).length
      const pendingCount = monthPayments.filter(p => p.status === 'pending').length
      const overdueCount = monthPayments.filter(p => p.status === 'overdue').length
      
      monthlyData.push({
        month,
        monthName: monthNamesShort[month - 1],
        year,
        totalIncome,
        paidCount,
        pendingCount,
        overdueCount,
        giftedCount,
        payments: monthPayments
      })
    }
    
    // Resumen general
    const totalYearIncome = monthlyData.reduce((sum, m) => sum + m.totalIncome, 0)
    const totalPaidPayments = payments.filter(p => p.status === 'paid').length
    const totalPendingPayments = payments.filter(p => p.status === 'pending').length
    const totalOverduePayments = payments.filter(p => p.status === 'overdue').length
    const totalGiftedPayments = payments.filter(p => p.isGifted).length
    
    // Obtener años con pagos registrados
    const yearsWithPayments = await db.payment.findMany({
      distinct: ['year'],
      select: { year: true },
      orderBy: { year: 'desc' }
    })
    
    return NextResponse.json({
      year,
      monthlyData,
      summary: {
        totalYearIncome,
        totalPaidPayments,
        totalPendingPayments,
        totalOverduePayments,
        totalGiftedPayments
      },
      availableYears: yearsWithPayments.map(y => y.year)
    })
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
