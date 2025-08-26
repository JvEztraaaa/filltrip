import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
]

export default function ContactUsPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [country, setCountry] = useState('US');
    const [phone, setPhone] = useState('');

    const handlePhoneInput = (e) => {
        const numeric = e.target.value.replace(/[^0-9]/g, '');
        const maxLength = country === 'PH' ? 12 : 7;
        setPhone(numeric.slice(0, maxLength));
    };

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col">
            {/* Header */}
            <header className="relative z-50">
                <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
                    <div className="flex lg:flex-1">
                        <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                            <span className="sr-only">FillTrip</span>
                            <img
                                alt="FillTrip Logo"
                                src="/images/logo.svg"
                                className="h-12 w-auto"
                            />
                            <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">FillTrip</span>
                        </Link>
                    </div>
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200 cursor-pointer"
                        >
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="size-6" />
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`text-sm/6 font-semibold transition-colors duration-200 hover:text-[#4FD1C5] hover:underline ${item.href === '/contact' ? 'text-[#4FD1C5] underline' : 'text-white'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <Link to="/login" className="text-sm/6 font-semibold text-white transition-colors duration-200 hover:text-[#4FD1C5] hover:underline">
                            Log in <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                </nav>
                <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                    <div className="fixed inset-0 z-50" />
                    <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
                        <div className="flex items-center justify-between">
                            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                                <span className="sr-only">FillTrip</span>
                                <img
                                    alt="FillTrip Logo"
                                    src="/images/logo.svg"
                                    className="h-8 w-auto"
                                />
                                <span className="text-xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">FillTrip</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="-m-2.5 rounded-md p-2.5 text-gray-200 cursor-pointer"
                            >
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon aria-hidden="true" className="size-6" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-white/10">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold transition-colors duration-200 hover:bg-white/5 hover:text-[#4FD1C5] hover:underline ${item.href === '/contact' ? 'text-[#4FD1C5] underline' : 'text-white'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6">
                                    <Link
                                        to="/login"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5 transition-colors duration-200 hover:text-[#4FD1C5] hover:underline"
                                    >
                                        Log in
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </Dialog>
            </header>

            {/* Main Content */}
            <div className="isolate flex-1 px-6 pt-6 lg:pt-8 lg:px-8 pb-20">
                {/* Decorative background */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)',
                        }}
                        className="relative -z-10 aspect-[1155/678] w-[60rem] max-w-none rotate-[30deg] bg-gradient-to-tr from-[#34d399] to-[#3b82f6] opacity-14 sm:w-[80rem]"
                    />
                </div>

                {/* Title + Description */}
                <div className="mx-auto max-w-2xl text-center px-4">
                    <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">Contact Us</h2>
                    <p className="mt-3 text-sm text-gray-400 sm:text-base lg:text-lg">
                        We're here to help and answer any questions you may have. Reach out to us and we'll respond as soon as possible.
                    </p>
                </div>

                {/* Contact Form */}
                <form action="#" method="POST" className="mx-auto mt-4 max-w-xl sm:mt-6 lg:mt-12 px-4">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6">
                        {/* First Name */}
                        <div>
                            <label htmlFor="first-name" className="block text-sm font-semibold text-white">
                                First name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="first-name"
                                    name="first-name"
                                    type="text"
                                    autoComplete="given-name"
                                    className="block w-full rounded-md bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] border border-transparent focus:border-[#168A8A] transition text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="last-name" className="block text-sm font-semibold text-white">
                                Last name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="last-name"
                                    name="last-name"
                                    type="text"
                                    autoComplete="family-name"
                                    className="block w-full rounded-md bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] border border-transparent focus:border-[#168A8A] transition text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-white">
                                Email
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className="block w-full rounded-md bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] border border-transparent focus:border-[#168A8A] transition text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="sm:col-span-2">
                            <label htmlFor="phone-number" className="block text-sm font-semibold text-white">
                                Phone number
                            </label>
                            <div className="mt-2">
                                <div className="flex rounded-md bg-white/5 border border-transparent focus-within:border-[#168A8A] focus-within:ring-2 focus-within:ring-[#4FD1C5] transition">
                                    {/* Country Selector */}
                                    <div className="grid shrink-0 grid-cols-1 focus-within:relative relative">
                                        <select
                                            id="country"
                                            name="country"
                                            value={country}
                                            onChange={(e) => {
                                                setCountry(e.target.value);
                                                setPhone(''); // reset phone when country changes
                                            }}
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-transparent py-2 pr-7 pl-3 text-base text-gray-400 placeholder:text-gray-500 focus:outline-none text-sm sm:text-base"
                                        >
                                            <option value="US">US</option>
                                            <option value="PH">PH</option>
                                        </select>
                                        <svg
                                            aria-hidden="true"
                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-4 text-gray-400 sm:size-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {/* Phone Input */}
                                    <input
                                        id="phone-number"
                                        name="phone-number"
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder={country === 'PH' ? '+63XXXXXXXXXX' : '+1XXXXXXXXXX'}
                                        value={phone}
                                        onInput={handlePhoneInput}
                                        className="block min-w-0 grow bg-transparent py-2 pr-3 pl-2 text-base text-white placeholder:text-gray-500 focus:outline-none text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="sm:col-span-2">
                            <label htmlFor="message" className="block text-sm font-semibold text-white">
                                Message
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    className="block w-full rounded-md bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] border border-transparent focus:border-[#168A8A] transition text-sm sm:text-base resize-none"
                                />
                            </div>
                        </div>

                        {/* Agree to policies */}
                        <div className="flex gap-x-3 sm:gap-x-4 sm:col-span-2">
                            <div className="flex h-6 items-center">
                                <div className="group relative inline-flex w-7 shrink-0 rounded-full bg-white/5 p-px inset-ring inset-ring-white/10 outline-offset-2 outline-[#4FD1C5] transition-colors duration-200 ease-in-out has-checked:bg-[#4FD1C5] has-focus-visible:outline-2">
                                    <span className="size-3.5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-3.5" />
                                    <input
                                        id="agree-to-policies"
                                        name="agree-to-policies"
                                        type="checkbox"
                                        aria-label="Agree to policies"
                                        className="absolute inset-0 appearance-none focus:outline-none"
                                    />
                                </div>
                            </div>
                            <label htmlFor="agree-to-policies" className="text-xs text-gray-400 sm:text-sm">
                                By selecting this, you agree to our{' '}
                                <a href="#" className="font-semibold text-[#4FD1C5] hover:text-[#168A8A] transition-colors duration-200">
                                    privacy policy
                                </a>
                                .
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 sm:mt-10 flex justify-center">
                        <button
                            type="submit"
                            className="w-full max-w-xs sm:max-w-sm rounded-md bg-gradient-to-r from-[#168A8A] to-[#0B2C36] px-6 py-2 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:from-[#0B2C36] hover:to-[#168A8A] hover:scale-105 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168A8A] sm:text-base cursor-pointer"
                        >
                            Let's talk
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
