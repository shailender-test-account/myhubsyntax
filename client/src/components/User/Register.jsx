// src/pages/Register.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


const BRAND_SVG = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="#e2432a" />
    <path d="M12 6L17 9V15L12 18L7 15V9L12 6Z" fill="#ffffff" fillOpacity="0.9" />
  </svg>
);

const PERSON_LG = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" fill="#fff" />
    <path
      d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const PERSON_SM = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="#fff" />
    <path
      d="M5 20c0-3.6 3.2-5.8 7-5.8s7 2.2 7 5.8"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const PERSON_XS = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 12a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" fill="#fff" />
    <path
      d="M6 19c0-3.2 2.8-5.1 6-5.1s6 1.9 6 5.1"
      stroke="#fff"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const EYE_OPEN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EYE_CLOSED = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path
      d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 5.1A11 11 0 0 1 12 5c7 0 11 7 11 7a13.5 13.5 0 0 1-3.4 4.1M6.3 6.3A13.7 13.7 0 0 0 1 12s4 7 11 7a10.9 10.9 0 0 0 4.2-.84"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CHECK_SVG = (
  <path
    d="M4 12.5l5 5L20 6"
    stroke="#2fa66a"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

const ERROR_SVG = (
  <>
    <path
      d="M12 8v5M12 16.5h.01"
      stroke="#e2432a"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="9" stroke="#e2432a" strokeWidth="2" />
  </>
);


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rules = {
  username(v) {
    if (!v) return "Username is required.";
    if (v.length < 4) return "Username must be at least 4 characters.";
    if (!/^[a-zA-Z0-9_.-]+$/.test(v))
      return "Only letters, numbers, . _ - are allowed.";
    return "";
  },
  email(v) {
    if (!v) return "Email address is required.";
    if (!EMAIL_RE.test(v)) return "Enter a valid email address.";
    return "";
  },
  role(v) {
    if (!v) return "Please select a role.";
    return "";
  },
  password(v) {
    if (!v) return "Password is required.";
    if (v.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Za-z]/.test(v) || !/\d/.test(v))
      return "Include at least one letter and one number.";
    return "";
  },
};

function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

/* ---------- Modal Component ---------- */
function Modal({ open, type, title, message, actions, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`modal-overlay${open ? " open" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div className="modal-box">
        <div className={`modal-icon ${type}`}>
          <svg viewBox="0 0 24 24" fill="none">
            {type === "success" ? CHECK_SVG : ERROR_SVG}
          </svg>
        </div>
        <h3 id="modalTitle">{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          {actions.map((a, i) => (
            <button
              key={i}
              type="button"
              className={`modal-btn ${a.primary ? "primary" : "ghost"}`}
              onClick={() => {
                onClose();
                a.onClick?.();
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function Register() {
  const Navigate=useNavigate()
  const [form, setForm] = useState({

    email: "",
    role: "",
    password: "",
    confirm: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [shake, setShake] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    actions: [],
  });

  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const roleRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const termsRef = useRef(null);

  /* ---------- Field validation helpers ---------- */
  const validateField = useCallback(
    (name, value, formState = form) => {
      if (name === "confirm") {
        if (!value) return "Please confirm your password.";
        if (value !== formState.password) return "Passwords do not match.";
        return "";
      }
      if (name === "terms") {
        return value ? "" : "You must accept the terms to continue.";
      }
      return rules[name]?.(value) ?? "";
    },
    [form]
  );

  /* ---------- Single handleChange for all fields ---------- */
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const next = { ...prev, [name]: newValue };

      // live re-validate the field itself
      const msg = validateField(name, newValue, next);
      setErrors((er) => ({ ...er, [name]: msg }));

      // keep confirm in sync if password changed
      if (name === "password" && next.confirm) {
        const confMsg = validateField("confirm", next.confirm, next);
        setErrors((er) => ({ ...er, confirm: confMsg }));
      }

      return next;
    });
  };

  const handleBlur = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    const value = form[name];
    const msg = validateField(name, value);
    setErrors((e) => ({ ...e, [name]: msg }));
    if (msg) {
      setShake((s) => ({ ...s, [name]: true }));
      setTimeout(() => setShake((s) => ({ ...s, [name]: false })), 450);
    }
  };


  const strengthScore = form.password
    ? Math.max(1, scorePassword(form.password))
    : 0;
  const strengthColors = ["#e7e9ee", "#e0554a", "#f0a63c", "#e8c93c", "#2fa66a"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  /* ---------- Modal helpers ---------- */
  const openModal = (cfg) => setModal({ ...cfg, open: true });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  /* ---------- Submit (axios) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fields = ["email", "role", "password", "confirm", "terms"];
    const newErrors = {};
    fields.forEach((f) => {
      newErrors[f] = validateField(f, form[f]);
    });
    setErrors(newErrors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

    const hasErrors = Object.values(newErrors).some(Boolean);

    if (hasErrors) {
      const firstBad = fields.find((f) => newErrors[f]);
      const refMap = {

        email: emailRef,
        role: roleRef,
        password: passwordRef,
        confirm: confirmRef,
        terms: termsRef,
      };
      refMap[firstBad]?.current?.focus?.();

      openModal({
        type: "error",
        title: "Check the highlighted fields",
        message:
          "A few fields need your attention before we can create the account.",
        actions: [{ label: "Got it", primary: true }],
      });
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        "/api/v1/auth/register",
        {
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!data?.success) {
        setLoading(false)
        openModal({
          type: "error",
          title: "Sign up failed",
          message:
            data?.message || "Something went wrong. Please try again.",
          actions: [
            {
              label: "Try again",
              primary: true,
              onClick: () => emailRef.current?.focus(),
            },
          ],
        });
        return;
      }

      const roleLabel =
        form.role.charAt(0).toUpperCase() + form.role.slice(1);

      openModal({
        type: "success",
        title: "Account created",
        message: `Welcome, ${form.email.trim()}. Your ${roleLabel} account is ready to use.`,
        actions: [
          {
            label: "Continue to sign in",
            primary: true,
            onClick: () => {
              setForm({

                email: "",
                role: "",
                password: "",
                confirm: "",
                terms: false,
              });
              setErrors({});
              setTouched({});
            },
          },
        ],
      });
      setLoading(false)
      setForm(
        {
          email: "",
          role: "",
          password: "",
          confirm: "",
          terms: false,
        }
      )
      Navigate("/")
    } catch (err) {
      setLoading(false)
      // axios errors: server returned non-2xx, or network failure
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";

      openModal({
        type: "error",
        title: "Sign up failed",
        message: serverMessage,
        actions: [
          {
            label: "Try again",
            primary: true,
            onClick: () => emailRef.current?.focus(),
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Small helpers for field classes ---------- */
  const fieldClass = (name) => {
    const classes = ["field"];
    if (errors[name] && touched[name]) classes.push("has-error");
    else if (form[name] && !errors[name]) classes.push("has-success");
    if (shake[name]) classes.push("shake");
    return classes.join(" ");
  };

  return (
    <div className="stage">
      <div className="card">
        {/* LEFT visual */}
        <div className="visual">
          <div className="brand-mark">
            {BRAND_SVG}
            Grovia
          </div>

          <div>
            <div className="hex-stage" aria-hidden="true">
              <span className="hex-outline a" />
              <span className="hex-outline b" />
              <div className="hex hex--lg">{PERSON_LG}</div>
              <div className="hex hex--red">{PERSON_SM}</div>
              <div className="hex hex--teal">{PERSON_SM}</div>
              <div className="hex hex--yellow">{PERSON_XS}</div>
              <div className="hex hex--purple">{PERSON_XS}</div>
            </div>

            <div className="visual-copy">
              <h1>Set Your Partner Recruitment on Auto-Pilot</h1>
              <p>
                Create your account to search, shortlist and manage digital
                partners in one place.
              </p>
            </div>
          </div>

          <div className="visual-footnote">
            © 2026 Grovia. All rights reserved.
          </div>
        </div>

        {/* RIGHT form panel */}
        <div className="form-panel">
          <div className="form-header">
            <p className="kicker">Register</p>
            <h2>Create your account</h2>
            <p>
              Join Grovia and get access to our best partner recommendations,
              tailored for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* <div className={fieldClass("username")}>
              <label htmlFor="username">Username</label>
              <div className="input-wrap">
                <input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  type="text"
                  placeholder="e.g. jane_doe"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={() => handleBlur("username")}
                />
              </div>
              <span className="error-msg">
                {errors.username && touched.username
                  ? errors.username
                  : "Username must be at least 4 characters."}
              </span>
            </div> */}

            {/* Email */}
            <div className={fieldClass("email")}>
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                />
              </div>
              <span className="error-msg">
                {errors.email && touched.email
                  ? errors.email
                  : "Enter a valid email address."}
              </span>
            </div>

            {/* Role */}
            <div className={fieldClass("role")}>
              <label htmlFor="role">Role</label>
              <div className="input-wrap">
                <select
                  ref={roleRef}
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  onBlur={() => handleBlur("role")}
                  required
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>

                </select>
              </div>
              <span className="error-msg">
                {errors.role && touched.role
                  ? errors.role
                  : "Please select a role."}
              </span>
            </div>

            {/* Password */}
            <div className={fieldClass("password")}>
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? EYE_CLOSED : EYE_OPEN}
                </button>
              </div>

              <div className="strength">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    style={{
                      background:
                        i < strengthScore
                          ? strengthColors[strengthScore]
                          : "#e7e9ee",
                    }}
                  />
                ))}
              </div>
              <span className="strength-label">
                {form.password ? strengthLabels[strengthScore] : ""}
              </span>
              <span className="error-msg">
                {errors.password && touched.password
                  ? errors.password
                  : "Min 8 characters, with a number and a letter."}
              </span>
            </div>

            {/* Confirm password */}
            <div className={fieldClass("confirm")}>
              <label htmlFor="confirm">Confirm password</label>
              <div className="input-wrap">
                <input
                  ref={confirmRef}
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirm")}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? EYE_CLOSED : EYE_OPEN}
                </button>
              </div>
              <span className="error-msg">
                {errors.confirm && touched.confirm
                  ? errors.confirm
                  : "Passwords do not match."}
              </span>
            </div>

            {/* Terms */}
            <label className="terms">
              <input
                ref={termsRef}
                id="terms"
                name="terms"
                type="checkbox"
                checked={form.terms}
                onChange={handleChange}
              />
              <span>
                I agree to Grovia's <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>
              </span>
            </label>
            <span className="error-msg">
              {errors.terms && touched.terms
                ? errors.terms
                : "You must accept the terms to continue."}
            </span>

            {/* Submit */}
            <button
              type="submit"
              className={`submit-btn${loading ? " is-loading" : ""}`}
              disabled={loading}
            >
              <span className={`spinner${loading ? " show" : ""}`} />
              <span>{loading ? "Creating account..." : "Create account"}</span>
            </button>

            <p className="switch-line">
              Already have an account? <Link to={"/login"}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        actions={modal.actions}
        onClose={closeModal}
      />
    </div>
  );
}