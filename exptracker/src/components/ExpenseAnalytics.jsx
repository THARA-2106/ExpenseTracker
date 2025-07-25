import { useState, useEffect } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'

function ExpenseAnalytics({ expenses }) {
  const [timeRange, setTimeRange] = useState('6months') // 6months, 1year, all
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState({})

  useEffect(() => {
    // Calculate date range based on selected time range
    const endDate = new Date()
    const startDate = timeRange === '6months' 
      ? subMonths(endDate, 6)
      : timeRange === '1year'
      ? subMonths(endDate, 12)
      : new Date(0) // Beginning of time for 'all'

    // Get all months in the range
    const months = eachMonthOfInterval({ start: startDate, end: endDate })

    // Calculate monthly totals
    const monthlyTotals = months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = parseISO(expense.date)
        return expenseDate >= monthStart && expenseDate <= monthEnd
      })

      const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

      return {
        month: format(month, 'MMM yyyy'),
        total,
        expenses: monthExpenses
      }
    })

    setMonthlyData(monthlyTotals)

    // Calculate category totals
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {})

    setCategoryData(categoryTotals)
  }, [expenses, timeRange])

  const getCategoryEmoji = (category) => {
    const emojis = {
      food: '🍔',
      transport: '🚗',
      shopping: '🛍️',
      bills: '📝',
      other: '📌'
    }
    return emojis[category] || '📌'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Expense Analytics</h2>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-select"
        >
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="analytics-grid">
        {/* Monthly Trends */}
        <div className="analytics-card">
          <h3>Monthly Spending Trends</h3>
          <div className="monthly-trends">
            {monthlyData.map(({ month, total }) => (
              <div key={month} className="trend-item">
                <div className="trend-header">
                  <span className="trend-month">{month}</span>
                  <span className="trend-amount">{formatCurrency(total)}</span>
                </div>
                <div className="trend-bar">
                  <div 
                    className="trend-bar-fill"
                    style={{ 
                      width: `${(total / Math.max(...monthlyData.map(m => m.total))) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Analysis */}
        <div className="analytics-card">
          <h3>Category-wise Spending</h3>
          <div className="category-analysis">
            {Object.entries(categoryData).map(([category, amount]) => (
              <div key={category} className="category-item">
                <div className="category-header">
                  <span className="category-name">
                    {getCategoryEmoji(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  <span className="category-amount">{formatCurrency(amount)}</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill"
                    style={{ 
                      width: `${(amount / Math.max(...Object.values(categoryData))) * 100}%` 
                    }}
                  />
                </div>
                <div className="category-percentage">
                  {((amount / Object.values(categoryData).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseAnalytics 