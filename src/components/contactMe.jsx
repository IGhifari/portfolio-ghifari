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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!serviceId || !templateId || !publicKey) {
                toast.error("Email service is not configured.", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                return;
            }
            await emailjs.send(
                serviceId,
                templateId,
                formData,
                publicKey
            );

            toast.success('Message sent successfully! 🎉', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });

            setFormData({ 
                emailto: "Ghifari",
                name: "", 
                email: "", 
                message: "" 
            });
        } catch (error) {
            toast.error('Failed to send message. Please try again! 😕', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            console.error("FAILED...", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-28 mt-4">
            <ToastContainer />
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">
                        <TypeIt
                            options={{ loop: false }}
                            getBeforeInit={(instance) => {
                                instance.type("Get in Touch");
                                return instance;
                            }}
                        />
                    </h1>
                    <p className="text-gray-400">
                        Feel free to reach out to me for any questions or
                        opportunities!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-black/50 backdrop-blur-md p-6 rounded-lg border border-cyan-500/30">
                            <h2 className="text-xl font-semibold mb-4">
                                Contact Information
                            </h2>
                            <div className="space-y-4">
                                <a
                                    href="mailto:ighifarii05@gmail.com"
                                    className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors"
                                >
                                    <IoMdMail size={24} />
                                    <span>ighifarii05@gmail.com</span>
                                </a>

                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-black/50 backdrop-blur-md p-6 rounded-lg border border-cyan-500/30">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your active email address"
                                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Type your message request here"
                                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-all duration-300 text-white font-medium flex items-center justify-center gap-2 ${
                                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactMe;
