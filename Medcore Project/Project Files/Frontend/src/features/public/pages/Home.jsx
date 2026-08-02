import {useState, useEffect} from "react";
import {
    ArrowRight,
    Activity,
    Shield,
    Clock,
    HeartPulse,
    Stethoscope,
    Microscope,
    Phone,
    Mail,
    MapPin,
    Sun,
    Moon,
} from "lucide-react";
import {Link} from "react-router";
import heroImage from "../../../assets/hero-bg.jpg";
import aboutImage from "../../../assets/about-bg.jpg";

export default function Home() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check local storage or system preference on mount
        const savedTheme = localStorage.getItem("theme");
        if (
            savedTheme === "dark" ||
            (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDarkMode(true);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* Navbar */}
            <header className="fixed w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-hospital-blue rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Med<span className="text-hospital-blue dark:text-blue-400">Core</span>
                            </span>
                        </div>
                        <nav className="hidden md:flex gap-6 text-sm font-medium">
                            <a
                                href="#services"
                                className="text-slate-600 dark:text-slate-300 hover:text-hospital-blue dark:hover:text-blue-400 transition-colors cursor-pointer"
                            >
                                Services
                            </a>
                            <a
                                href="#about"
                                className="text-slate-600 dark:text-slate-300 hover:text-hospital-blue dark:hover:text-blue-400 transition-colors cursor-pointer"
                            >
                                About Us
                            </a>
                            <a
                                href="#contact"
                                className="text-slate-600 dark:text-slate-300 hover:text-hospital-blue dark:hover:text-blue-400 transition-colors cursor-pointer"
                            >
                                Contact
                            </a>
                        </nav>
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                                aria-label="Toggle Dark Mode"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <Link
                                to="/login?type=staff"
                                className="text-slate-600 dark:text-slate-300 hover:text-hospital-blue dark:hover:text-blue-400 transition-colors hidden sm:block"
                            >
                                Staff Login
                            </Link>
                            <Link
                                to="/login?type=patient"
                                className="bg-hospital-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Patient Portal
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                            <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-hospital-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 mb-6 border border-blue-100 dark:border-blue-800">
                                <span className="flex w-2 h-2 rounded-full bg-hospital-blue dark:bg-blue-400 mr-2"></span>
                                Accepting New Patients
                            </div>
                            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                                <span className="block xl:inline">Advanced Healthcare,</span>{" "}
                                <span className="block text-hospital-blue dark:text-blue-400">
                                    Simplified For You.
                                </span>
                            </h1>
                            <p className="mt-3 text-base text-slate-500 dark:text-slate-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 leading-relaxed">
                                Experience the future of medical care with our state-of-the-art hospital
                                management system. Book appointments, access records, and consult top doctors
                                seamlessly.
                            </p>
                            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-3">
                                <Link
                                    to="/login?type=patient"
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-hospital-blue hover:bg-blue-700 md:text-lg transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Book Appointment
                                </Link>
                                <Link
                                    to="/login?type=patient"
                                    className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-700 text-base font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 md:text-lg transition-colors"
                                >
                                    View Reports
                                </Link>
                            </div>
                        </div>
                        <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                            <div className="relative mx-auto w-full rounded-2xl shadow-xl lg:max-w-md overflow-hidden `aspect-4/3` flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                <img
                                    src={heroImage}
                                    alt="Modern Hospital Facility"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Stats / Trust Strip */}
            <section className="bg-hospital-blue dark:bg-slate-800 py-10 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-400/30 dark:divide-slate-700">
                        <div>
                            <p className="text-3xl font-bold text-white">15+</p>
                            <p className="mt-1 text-sm text-blue-100 dark:text-slate-400 font-medium">
                                Years Experience
                            </p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">50+</p>
                            <p className="mt-1 text-sm text-blue-100 dark:text-slate-400 font-medium">
                                Specialist Doctors
                            </p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">10k+</p>
                            <p className="mt-1 text-sm text-blue-100 dark:text-slate-400 font-medium">
                                Happy Patients
                            </p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">24/7</p>
                            <p className="mt-1 text-sm text-blue-100 dark:text-slate-400 font-medium">
                                Emergency Care
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section
                id="services"
                className="py-20 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-base text-hospital-blue dark:text-blue-400 font-semibold tracking-wide uppercase">
                            Our Departments
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                            Comprehensive Medical Services
                        </p>
                        <p className="mt-4 max-w-2xl text-lg text-slate-500 dark:text-slate-400 mx-auto">
                            We provide a wide range of specialized medical services to cater to all your
                            healthcare needs under one roof.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-6">
                                <HeartPulse className="w-6 h-6 text-hospital-blue dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                Cardiology
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Advanced cardiac care, heart surgeries, and comprehensive heart health
                                checkups.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-6">
                                <Stethoscope className="w-6 h-6 text-hospital-blue dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                General Medicine
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Primary care, routine checkups, and treatment for common illnesses and chronic
                                conditions.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-6">
                                <Microscope className="w-6 h-6 text-hospital-blue dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                Laboratory
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Fully equipped pathology lab for accurate and rapid diagnostic testing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        <div className="mb-10 lg:mb-0">
                            <div className="relative `aspect-4/3` rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
                                <img
                                    src={aboutImage}
                                    alt="Doctor consulting patient"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base text-hospital-blue dark:text-blue-400 font-semibold tracking-wide uppercase">
                                About Us
                            </h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                Dedicated to Your Health & Well-being
                            </p>
                            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                                Since our founding, MedCore Hospital has been committed to providing
                                compassionate, high-quality medical care to our community. Our
                                state-of-the-art facilities and experienced medical professionals ensure you
                                receive the best possible treatment.
                            </p>
                            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                                We believe in combining advanced technology with a human touch to deliver
                                healthcare that is both effective and comforting.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer
                id="contact"
                className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 border-t border-slate-800 transition-colors duration-300"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-6 h-6 text-hospital-blue dark:text-blue-400" />
                                <span className="text-2xl font-bold text-white tracking-tight">
                                    Med<span className="text-hospital-blue dark:text-blue-400">Core</span>
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
                                Delivering world-class healthcare with compassion and advanced technology.
                                Your health is our priority.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-hospital-blue dark:hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#services"
                                        className="hover:text-hospital-blue dark:hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                        Our Services
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#about"
                                        className="hover:text-hospital-blue dark:hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        to="/login?type=patient"
                                        className="hover:text-hospital-blue dark:hover:text-blue-400 transition-colors"
                                    >
                                        Patient Portal
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-hospital-blue dark:text-blue-400 shrink-0" />
                                    <span>123 Health Avenue, Medical District, City, 10001</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-hospital-blue dark:text-blue-400 shrink-0" />
                                    <span>+1 (800) 123-4567</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-hospital-blue dark:text-blue-400 shrink-0" />
                                    <span>support@medcore.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                        <p>&copy; {new Date().getFullYear()} MedCore Hospital. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors cursor-pointer">
                                Privacy Policy
                            </a>
                            <a href="#" className="hover:text-white transition-colors cursor-pointer">
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
