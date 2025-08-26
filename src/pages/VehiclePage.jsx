import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

import motor from '../images/motor.png'
import car from '../images/car.png'
import truck from '../images/truck.png'

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Vehicle', href: '/vehicle' },
    { name: 'Contact Us', href: '/contact' },
]

const sections = [
    {
        id: 1,
        title: 'Two Wheeler',
        description: "Motorcycles, Scooters.",
        imageUrl: motor
    },
    {
        id: 2,
        title: 'Four Wheeler',
        description: "Cars, SUVs, Vans, Pickup Trucks.",
        imageUrl: car
    },
    {
        id: 3,
        title: 'Multi Wheeler',
        description: "Trucks, Buses, Trailers, Tankers.",
        imageUrl: truck
    },

]


export default function VehiclePage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="bg-gray-900 w-full min-h-screen">
            {/* Header reused */}
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
                                className={`text-sm/6 font-semibold transition-colors duration-200 hover:text-[#4FD1C5] hover:underline ${item.href === '/vehicle' ? 'text-[#4FD1C5] underline' : 'text-white'}`}
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
                    <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
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
                                            className={`-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold transition-colors duration-200 hover:bg-white/5 hover:text-[#4FD1C5] hover:underline ${item.href === '/about' ? 'text-[#4FD1C5] underline' : 'text-white'}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6">
                                    <Link
                                        to="/login"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5 transition-colors duration-200 hover:text-[#4FD1C5] hover:underline"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </Dialog>
            </header>

            { }
            <div className="relative isolate px-4 pt-10 sm:pt-16 lg:px-6 max-w-5xl mx-auto pb-10">
                { }
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div
                        style={{
                            clipPath:
                                'polygon(80% 20%, 100% 50%, 95% 10%, 85% 0%, 5% 5%, 65% 25%, 60% 80%, 45% 90%, 35% 0%, 40% 40%, 20% 95%, 0% 70%, 15% 100%, 30% 85%, 85% 100%, 80% 20%)',
                        }}
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[10deg] bg-gradient-to-tr from-red-400 to-green-300 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]" />
                    <div
                        style={{
                            clipPath:
                                'polygon(60% 10%, 90% 30%, 100% 0%, 70% 5%, 50% 20%, 40% 0%, 30% 30%, 10% 10%, 0% 50%, 20% 70%, 0% 100%, 40% 90%, 60% 100%, 80% 80%, 100% 100%, 90% 60%)',
                        }}
                        className="absolute top-[30%] left-[20%] aspect-[1155/678] w-[28rem] rotate-[25deg] bg-gradient-to-tr from-blue-400 to-purple-300 opacity-25 sm:w-[50rem] -z-10" />
                    <div
                        style={{
                            clipPath:
                                'polygon(10% 20%, 30% 10%, 50% 0%, 70% 10%, 90% 30%, 100% 60%, 90% 90%, 70% 100%, 50% 90%, 30% 100%, 10% 80%, 0% 60%, 10% 40%)',
                        }}
                        className="absolute bottom-[-10%] right-[10%] aspect-[1155/678] w-[32rem] rotate-[15deg] bg-gradient-to-tr from-yellow-300 to-pink-400 opacity-20 sm:w-[60rem] -z-10" />

                </div>
                {/* Responsive Articles Grid */}
                <div className="mx-auto mt-6 w-full max-w-5xl px-2 sm:px-4 lg:px-0 border-0 border-amber-600">
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 border-0 border-pink-600">
                        {sections.map((s, index) => (
                            <article
                                key={s.id}
                                className="flex flex-col justify-between rounded-lg border border-gray-500 bg-gray-800 p-3 sm:p-5 md:p-6 hover:bg-gray-900 transition-all duration-350 shadow-sm"
                            >
                                <div className="grow">
                                    <img
                                        src={s.imageUrl}
                                        alt={s.title}
                                        className="w-full h-48 object-cover rounded-t-lg mb-3"
                                    />
                                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-white hover:text-[#4FD1C5] text-balance">
                                        {s.title}
                                    </h3>
                                    <p className="mt-1 text-[11px] sm:text-xs md:text-sm text-gray-200 text-pretty">
                                        {s.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
