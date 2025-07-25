import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Signup from './components/Signup'
import BudgetManager from './components/BudgetManager'
import ExpenseAnalytics from './components/ExpenseAnalytics'

function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(true)
  const [expenses, setExpenses] = useState([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [editingExpense, setEditingExpense] = useState(null)

  // Load expenses from localStorage when user logs in
  useEffect(() => {
    if (user) {
      // Fetch expenses from backend
      const fetchExpenses = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          // Handle case where token is missing (shouldn't happen after successful login)
          console.error('Authentication token not found');
          return;
        }
        try {
          const response = await fetch('http://localhost:5000/api/expenses', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch expenses');
          }
          const data = await response.json();
          setExpenses(data); // Update state with expenses from backend
        } catch (error) {
          console.error('Error fetching expenses:', error);
          // Optionally show an error message to the user
        }
      };
      fetchExpenses();
    } else {
      // Clear expenses when user logs out
      setExpenses([]);
    }
  }, [user])

  const handleLogin = (userData) => {
    setUser(userData)
    setShowLogin(false)
  }

  const handleSignup = (userData) => {
    setUser(userData)
    setShowLogin(false)
  }

  const handleLogout = () => {
    setUser(null)
    setExpenses([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Simple validation
    if (!description || !amount || !category || !date) {
      console.error('Please fill in all fields'); // Or show a user-friendly message
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
       console.error('Authentication token not found');
       return;
    }

    const expenseData = {
      description,
      amount: Number(amount), // Ensure amount is a number
      category,
      date
    };

    try {
      if (editingExpense) {
        // Update existing expense
        const response = await fetch(`http://localhost:5000/api/expenses/${editingExpense._id}`, { // Use _id from backend
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(expenseData),
        });

        if (!response.ok) {
          throw new Error('Failed to update expense');
        }

        const updatedExpense = await response.json();
        // Update state with the updated expense from backend
        setExpenses(expenses.map(exp =>
          exp._id === updatedExpense._id ? updatedExpense : exp // Use _id for comparison
        ));
        setEditingExpense(null);

      } else {
        // Add new expense
        const response = await fetch('http://localhost:5000/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(expenseData),
        });

        if (!response.ok) {
          throw new Error('Failed to add expense');
        }

        const newExpense = await response.json();
        // Add the new expense from backend to state
        setExpenses([...expenses, newExpense]);
      }

      // Clear form fields after successful submission
      setDescription('');
      setAmount('');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);

    } catch (error) {
      console.error('Error submitting expense:', error);
      // Optionally show an error message to the user
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date.split('T')[0]); // Format date for input field
  }

  const handleCancelEdit = () => {
    setEditingExpense(null)
    setDescription('')
    setAmount('')
    setCategory('food')
    setDate(new Date().toISOString().split('T')[0])
  }

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
       console.error('Authentication token not found');
       return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      // Remove the deleted expense from state
      setExpenses(expenses.filter(exp => exp._id !== id)); // Use _id for filtering

    } catch (error) {
      console.error('Error deleting expense:', error);
      // Optionally show an error message to the user
    }
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const categories = {
    food: '🍔 Food',
    transport: '🚗 Transport',
    shopping: '🛍️ Shopping',
    bills: '📝 Bills',
    other: '📌 Other'
  }

  if (!user) {
    return (
      <div className="auth-container">
        {showLogin ? (
          <Login onLogin={handleLogin} onSwitch={() => setShowLogin(false)} />
        ) : (
          <Signup onSignup={handleSignup} onSwitch={() => setShowLogin(true)} />
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>Expense Tracker</h1>
          <div className="user-info">
            <span>Welcome, {user.name}!</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        <div className="total-balance">
          <span>Total Spent:</span>
          <span className="amount">Rs {total.toFixed(2)}</span>
        </div>
      </header>
      
      <main>
        <BudgetManager expenses={expenses} />
        
        <div className="expense-form">
          <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="shopping">Shopping</option>
                <option value="bills">Bills</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="button-group">
              <button type="submit" className="submit-button">
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
              {editingExpense && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="expenses-list">
          <h2>Recent Expenses</h2>
          {expenses.length === 0 ? (
            <p>No expenses yet. Add your first expense above!</p>
          ) : (
            <ul>
              {expenses.map((expense) => (
                <li key={expense.id} className="expense-item">
                  <div className="expense-info">
                    <span className="expense-description">
                      {expense.description}
                    </span>
                    <span className="expense-category">
                      {categories[expense.category]}
                    </span>
                    <span className="expense-date">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="expense-amount">
                    Rs {expense.amount.toFixed(2)}
                  </div>
                  <div className="expense-actions">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="edit-button"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="delete-button"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ExpenseAnalytics expenses={expenses} />
      </main>
    </div>
  )
}

export default App