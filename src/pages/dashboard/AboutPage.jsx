import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { 
    Bars3Icon, 
    XMarkIcon,
    RocketLaunchIcon,
    EyeIcon,
    CalculatorIcon,
    LightBulbIcon,
    ChartBarIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
]

const sections = [
    {
        id: 1,
        title: 'Mission',
        description: "Making travel smarter and more sustainable through intelligent fuel management.",
        icon: RocketLaunchIcon,
    },
    {
        id: 2,
        title: 'Vision',
        description: "Every trip planned efficiently, saving money and protecting the environment.",
        icon: EyeIcon,
    },
    {
        id: 3,
        title: 'Fuel Calculator',
        description: "Instant trip cost estimates with real-time fuel prices and vehicle data.",
        icon: CalculatorIcon,
    },
    {
        id: 4,
        title: 'Smart Planning',
        description: "Budget confidently with accurate distances and efficiency calculations.",
        icon: LightBulbIcon,
    },
    {
        id: 5,
        title: 'Track & Analyze',
        description: "Monitor spending patterns and optimize your driving habits.",
        icon: ChartBarIcon,
    },
    {
        id: 6,
        title: 'Save Money',
        description: "Cut costs and maximize every liter with data-driven insights.",
        icon: CurrencyDollarIcon,
    },
]

const people = [
    { name: 'Jan Vincent Estrada', role: 'Front-end Developer', imageUrl: '/images/estrada.png' },
    { name: 'Dian Mendoza', role: 'Back-end Developer', imageUrl: '/images/mendoza.png' },
    { name: 'Gabriel Rola', role: 'Front-end Developer', imageUrl: '/images/rola.png' },
    { name: 'Gervhee Velez', role: 'Front-end Developer', imageUrl: '/images/velez.png' },
    { name: 'Mark Gabrielle Dela Cruz', role: 'Back-end Developer', imageUrl: '/images/dela-cruz.png' },
    { name: 'Pauline Manaois', role: 'UI/UX Designer', imageUrl: '/images/manaois.png' },
]

export default function AboutPage() {
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
                                className={`text-sm/6 font-semibold transition-colors duration-200 hover:text-[#4FD1C5] hover:underline ${item.href === '/about' ? 'text-[#4FD1C5] underline' : 'text-white'}`}
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
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-400 to-green-300 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
                    />
                </div>

                {/* Title */}
                <div className="text-center mb-8 sm:mb-10">
                    <h1 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl">
                        About <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-extrabold">FillTrip</span>
                    </h1>
                    <p className="mt-4 text-base font-medium text-pretty text-gray-400 sm:text-lg">
                        Learn more about our mission, vision, and the team behind FillTrip.
                    </p>
                </div>

                {/* Responsive Articles Grid */}
                <div className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Mobile: Single column, Tablet: 2 columns, Desktop: 3 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {sections.map((section, index) => {
                            const IconComponent = section.icon;
                            return (
                                <article
                                    key={section.id}
                                    className="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 sm:p-8 hover:border-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 backdrop-blur-sm"
                                >
                                    {/* Icon */}
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-green-500/20 group-hover:from-blue-500/30 group-hover:to-green-500/30 transition-all duration-300">
                                        <IconComponent className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-blue-100 transition-colors duration-300">
                                            {section.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                                            {section.description}
                                        </p>
                                    </div>
                                    
                                    {/* Subtle accent border */}
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/60 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                { }
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[32rem] -translate-x-1/2 bg-gradient-to-tr from-blue-400 to-green-300 opacity-30 sm:left-[calc(50%+24rem)] sm:w-[60rem]"
                    />
                </div>

                {/* Leadership / Team Section */}
                <div className="mt-12 py-10 sm:mt-16 sm:py-14">
                    {/* Responsive layout: stack on mobile/tablet, 3-column only on large screens */}
                    {/* Added responsive left padding/margin to visually center content on medium widths */}
                    <div className="mx-auto grid max-w-5xl gap-y-10 gap-x-12 sm:gap-x-16 md:gap-x-20 lg:gap-x-28 px-3 sm:px-6 md:px-8 md:pl-14 lg:px-0 lg:grid-cols-3 items-start">
                        <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl font-semibold tracking-tight text-white mb-4 lg:mb-3 leading-snug">
                                Meet our Developers
                            </h2>
                            <p className="text-sm sm:text-base md:text-lg text-gray-400 text-center lg:text-left max-w-prose mx-auto lg:mx-0">
                                We’re a small team of students who built Filltrip to make fuel tracking and trip planning easier.
                            </p>
                        </div>
                        <ul role="list" className="mt-2 lg:mt-0 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-2">
                            {people.map((person) => (
                                <li key={person.name} className="">
                                    <div className="flex items-center gap-x-3 md:gap-x-4 w-full p-1.5 rounded-lg hover:bg-gray-800/40 transition-colors">
                                        <img
                                            alt={person.name}
                                            src={person.imageUrl}
                                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full outline-1 -outline-offset-1 outline-white/10 object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm sm:text-base md:text-lg font-semibold tracking-tight text-white break-words">{person.name}</h3>
                                            <p className="mt-0.5 text-xs sm:text-sm md:text-base font-normal text-indigo-400 break-words">{person.role}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
