import { useState, useEffect } from 'react'

function BudgetManager({ expenses }) {
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('budgets')
    return saved ? JSON.parse(saved) : {
      food: 500,
      transport: 200,
      shopping: 300,
      bills: 1000,
      other: 200
    }
  })

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets))
  }, [budgets])

  const categories = {
    food: '🍔 Food',
    transport: '🚗 Transport',
    shopping: '🛍️ Shopping',
    bills: '📝 Bills',
    other: '📌 Other'
  }

  const spent = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {})

  const handleBudgetChange = (category, value) => {
    setBudgets(prev => ({
      ...prev,
      [category]: Math.max(0, Number(value))
    }))
  }

  return (
    <div className="budget-manager">
      <h2>Budget Overview</h2>
      <div className="budget-grid">
        {Object.entries(categories).map(([key, label]) => {
          const spentAmount = spent[key] || 0
          const budget = budgets[key]
          const percentage = (spentAmount / budget) * 100
          const isOverBudget = percentage > 100

          return (
            <div key={key} className="budget-card">
              <div className="budget-header">
                <span>{label}</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => handleBudgetChange(key, e.target.value)}
                  min="0"
                  className="budget-input"
                />
              </div>
              <div className="budget-progress">
                <div 
                  className="progress-bar"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: isOverBudget ? 'var(--danger-color)' : 'var(--success-color)'
                  }}
                />
              </div>
              <div className="budget-details">
                <span>Spent: Rs {spentAmount.toFixed(2)}</span>
                <span>Remaining: Rs {(budget - spentAmount).toFixed(2)}</span>
              </div>
              {isOverBudget && (
                <div className="budget-warning">
                  ⚠️ Over budget by ${(spentAmount - budget).toFixed(2)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BudgetManager 