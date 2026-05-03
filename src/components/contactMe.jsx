import React, { useState } from "react";
import TypeIt from "typeit-react";
import { IoMdMail } from "react-icons/io";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from "@emailjs/browser";

const ContactMe = () => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const [formData, setFormData] = useState({
        emailto: "Ghifari",
        name: "",
        email: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!serviceId || !templateId || !publicKey) {
                toast.error("Email service is not configured.", { theme: "dark" });
                return;
            }
            await emailjs.send(serviceId, templateId, formData, publicKey);
            toast.success('Message sent successfully! 🎉', { theme: "dark" });
            setFormData({ emailto: "Ghifari", name: "", email: "", message: "" });
        } catch (error) {
            toast.error('Failed to send message. Please try again! 😕', { theme: "dark" });
            console.error("FAILED...", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "nb-input";

    return (
        <div className="container mx-auto px-6 py-16">
            <ToastContainer />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1
                        className="text-4xl md:text-5xl font-black font-grotesk inline-block"
                        style={{
                            background: 'var(--nb-yellow)',
                            border: 'var(--nb-border)',
                            boxShadow: 'var(--nb-shadow)',
                            padding: '8px 24px',
                            color: 'var(--nb-black)',
                        }}
                    >
                        <TypeIt
                            options={{ loop: false }}
                            getBeforeInit={(instance) => {
                                instance.type("GET IN TOUCH");
                                return instance;
                            }}
                        />
                    </h1>
                    <p className="font-grotesk text-base mt-4" style={{ color: '#555' }}>
                        Feel free to reach out for any questions or opportunities!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info Card */}
                    <div
                        className="p-6 flex flex-col gap-4"
                        style={{
                            background: 'var(--nb-white)',
                            border: 'var(--nb-border)',
                            boxShadow: 'var(--nb-shadow-lg)',
                        }}
                    >
                        <h2
                            className="font-black font-grotesk text-xl inline-block"
                            style={{
                                background: 'var(--nb-black)',
                                color: 'var(--nb-yellow)',
                                padding: '4px 12px',
                                border: 'var(--nb-border)',
                            }}
                        >
                            CONTACT INFO
                        </h2>
                        <a
                            href="mailto:ighifarii05@gmail.com"
                            className="flex items-center gap-3 font-grotesk font-semibold transition-all duration-150"
                            style={{ color: 'var(--nb-black)', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--nb-red)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--nb-black)'}
                        >
                            <div
                                className="w-10 h-10 flex items-center justify-center"
                                style={{ background: 'var(--nb-yellow)', border: 'var(--nb-border)' }}
                            >
                                <IoMdMail size={20} />
                            </div>
                            <span className="font-mono text-sm">ighifarii05@gmail.com</span>
                        </a>

                        {/* Decorative blocks */}
                        <div className="mt-auto flex gap-2">
                            <div style={{ flex: 1, height: '8px', background: 'var(--nb-yellow)', border: '2px solid var(--nb-black)' }} />
                            <div style={{ flex: 1, height: '8px', background: 'var(--nb-red)', border: '2px solid var(--nb-black)' }} />
                            <div style={{ flex: 1, height: '8px', background: 'var(--nb-black)' }} />
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div
                        className="p-6"
                        style={{
                            background: 'var(--nb-white)',
                            border: 'var(--nb-border)',
                            boxShadow: 'var(--nb-shadow-lg)',
                        }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block font-grotesk font-bold text-sm mb-1"
                                    style={{ color: 'var(--nb-black)' }}
                                >
                                    NAME *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block font-grotesk font-bold text-sm mb-1"
                                    style={{ color: 'var(--nb-black)' }}
                                >
                                    EMAIL *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your active email"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label
                                    htmlFor="message"
                                    className="block font-grotesk font-bold text-sm mb-1"
                                    style={{ color: 'var(--nb-black)' }}
                                >
                                    MESSAGE *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Type your message here..."
                                    className={inputClass}
                                    required
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                id="submit-contact"
                                disabled={isSubmitting}
                                className="nb-btn w-full py-3 font-grotesk font-black text-base"
                                style={{
                                    background: isSubmitting ? '#555' : 'var(--nb-black)',
                                    color: 'var(--nb-yellow)',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        SENDING...
                                    </span>
                                ) : 'SEND MESSAGE →'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactMe;
