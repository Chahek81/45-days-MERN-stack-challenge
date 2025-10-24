import React, { useState } from 'react'

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email)
}

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validateField = (fieldName, value) => {
    const v = (value || '').trim()
    switch (fieldName) {
      case 'name':
        if (!v) return 'Name is required.'
        if (v.length < 2) return 'Name must be at least 2 characters.'
        return ''
      case 'email':
        if (!v) return 'Email is required.'
        if (!validateEmail(v)) return 'Please enter a valid email address.'
        return ''
      case 'message':
        if (!v) return 'Message is required.'
        if (v.length < 10) return 'Message must be at least 10 characters.'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // validate as user types but only show errors if field is touched
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const validateAll = () => {
    const next = {}
    Object.keys(form).forEach(k => {
      const err = validateField(k, form[k])
      if (err) next[k] = err
    })
    setErrors(next)
    setTouched({ name: true, email: true, message: true })
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateAll()) return
    setSubmitting(true)
    // simulate network request
    setTimeout(() => {
      console.log('Form submitted:', form)
      setSubmitting(false)
      setSubmitted(true)
      setForm({ name: '', email: '', message: '' })
      setErrors({})
      setTouched({})
      // auto-hide success toast
      setTimeout(() => setSubmitted(false), 4000)
    }, 900)
  }

  const anyErrors = Object.values(errors).some(Boolean)
  const anyEmpty = !form.name.trim() || !form.email.trim() || !form.message.trim()
  const isDisabled = submitting || anyErrors || anyEmpty

  return (
    <div className="contact-wrap">
      <div className="card">
        <div className="card-header">
          <h2>Say hello 👋</h2>
          <p className="lead">Questions, feedback or collaboration? Send a message — I&apos;ll reply soon.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="contact-form">
          <div className={`field ${errors.name && touched.name ? 'has-error' : ''}`}>
            <label htmlFor="name">Name</label>
            <div className="input-row">
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Your name"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              <svg className="icon" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zM4 20.5c0-2.7 4.3-4 8-4s8 1.3 8 4V22H4v-1.5z" />
              </svg>
            </div>
            {errors.name && touched.name && <div id="name-error" className="error">{errors.name}</div>}
          </div>

          <div className={`field ${errors.email && touched.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Email</label>
            <div className="input-row">
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              <svg className="icon" viewBox="0 0 24 24" aria-hidden>
                <path d="M2 6.5v11A2.5 2.5 0 0 0 4.5 20h15a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 19.5 4h-15A2.5 2.5 0 0 0 2 6.5zm2 .5l7 4.5 7-4.5v9H4V7z" />
              </svg>
            </div>
            {errors.email && touched.email && <div id="email-error" className="error">{errors.email}</div>}
          </div>

          <div className={`field ${errors.message && touched.message ? 'has-error' : ''}`}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Write your message..."
              rows={6}
              maxLength={500}
              aria-invalid={errors.message ? 'true' : 'false'}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            <div className="meta">
              <small>{form.message.length} / 500</small>
              <div className="progress" aria-hidden>
                <div className="bar" style={{ width: `${(form.message.length / 500) * 100}%` }} />
              </div>
            </div>
            {errors.message && touched.message && <div id="message-error" className="error">{errors.message}</div>}
          </div>

          <div className="actions">
            <button type="submit" className="btn" disabled={isDisabled} aria-busy={submitting}>
              {submitting ? (
                <span className="spinner" aria-hidden></span>
              ) : (
                'Send Message'
              )}
            </button>
            <div className="hint">Prefer a quick reply? Add your preferred contact hours in the message.</div>
          </div>
        </form>
      </div>

      {submitted && (
        <div className="toast" role="status" aria-live="polite">
          <strong>Sent!</strong>
          <div className="toast-body">Thanks — your message is on its way. I usually reply within 24 hours.</div>
        </div>
      )}
    </div>
  )
}
