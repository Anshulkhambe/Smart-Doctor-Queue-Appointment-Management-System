import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  CalendarRange, 
  Clock, 
  Users, 
  ShieldCheck, 
  Heart, 
  MessageSquare, 
  HelpCircle, 
  MapPin, 
  Mail, 
  Phone,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const services = [
    { icon: Stethoscope, title: "General Consultations", desc: "Expert assessment and diagnosis of general health concerns and symptoms." },
    { icon: CalendarRange, title: "Queue-less Scheduling", desc: "Schedule online and monitor your spot in real-time, eliminating lobby wait times." },
    { icon: Clock, title: "Live Tracking", desc: "Know exactly how many patients are ahead of you and check dynamic wait estimations." },
    { icon: Users, title: "Experienced Staff", desc: "Connect with board-certified medical specialists across multiple clinical areas." },
    { icon: ShieldCheck, title: "Role-Based Access", desc: "Secure portal authentication for patients, staff, doctors, and system administrators." },
    { icon: Heart, title: "Emergency Support", desc: "Dedicated emergency response resources and priority queuing for critical patients." }
  ];

  const testimonials = [
    { name: "Sarah Jenkins", role: "Patient", quote: "The live queue tracker is a game-changer! I waited at home instead of sitting in a crowded waiting room for an hour. Simply brilliant." },
    { name: "Dr. Adrian Vance", role: "Specialist", quote: "Managing appointments and advancing patients with a single click has greatly streamlined my daily clinical workflow." },
    { name: "David Miller", role: "Patient", quote: "Smooth interface, instant socket updates, and very clear estimations. Booking with my general practitioner has never been easier." }
  ];

  const faqs = [
    { q: "How does the live queue tracking system work?", a: "Every booked appointment receives a unique queue sequence number. When the doctor marks a patient as completed or delayed, updates propagate in real-time to all connected patients via Socket.io." },
    { q: "Can I cancel or reschedule my appointment?", a: "Yes, patients can cancel their bookings directly from their dashboard. Cancelling an appointment automatically recalculates wait times for subsequent patients." },
    { q: "What happens if a doctor gets delayed?", a: "If the doctor clicks the delay button, the system adds the delay offset to all remaining appointments and sends immediate notifications and emails to all upcoming patients." },
    { q: "Is registration free for patients?", a: "Absolutely. Patients can sign up, create their profiles, and search for active doctors in their region at no cost." }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-300 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
        </div>

        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600 dark:bg-sky-950/30 dark:text-sky-400">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Modern Clinical Workflows
          </div>
          
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Smart Queue & <br />
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-indigo-400">
              Appointment Management
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Ditch the crowded waiting lobbies. Schedule appointments online, track live doctor queue positions, and get dynamic wait-time estimations directly on your mobile device.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/signup"
              className="rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition-all duration-200"
            >
              Get Started Now
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold leading-6 text-slate-900 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
            >
              Sign In to Dashboard <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Services Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Our Core Features</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Modern tools designed to facilitate patient scheduling and treatment coordination.</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div 
                key={i} 
                className="glass shadow-card group rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] dark:bg-slate-800/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 transition-colors duration-300 group-hover:bg-sky-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">{svc.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{svc.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Live Queue Mechanics */}
      <section className="bg-slate-100/50 dark:bg-slate-900/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Real-Time Sync Engine</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                Our architecture uses Socket.io server listeners. When a doctor advances the daily treatment ledger by clicking "Next Patient," sequence counts and estimated minutes ahead shift instantly for all patient queues.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Patient books time slot</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Instantly gets queue position and wait estimation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Real-time status updates</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Email and push alerts warn the patient when their turn is next.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual Queue Card mockup */}
            <div className="flex justify-center">
              <div className="glass shadow-card w-full max-w-md rounded-3xl p-6 dark:bg-slate-800/60 border border-sky-100/30">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Dr. Elizabeth Blackwell</h4>
                    <p className="text-xs text-slate-400">Cardiology specialist</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">Active</span>
                </div>
                
                <div className="my-8 text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Queue Position</span>
                  <h3 className="text-6xl font-black text-sky-600 dark:text-sky-400 mt-2">#08</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Patients Ahead</span>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">2 Patients</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Estimated Wait</span>
                    <p className="text-lg font-bold text-emerald-500">~ 30 mins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">What Patients & Doctors Say</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Hear from practitioners and patients using our queue management workflows.</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="glass shadow-card flex flex-col justify-between rounded-3xl p-6 dark:bg-slate-800/40">
              <p className="text-sm italic text-slate-600 dark:text-slate-300">"{t.quote}"</p>
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-700/50">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
                <p className="text-xs text-sky-600 dark:text-sky-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="bg-slate-100/30 dark:bg-slate-900/10 py-24 border-t border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl flex items-center justify-center gap-2">
              <HelpCircle className="h-7 w-7 text-sky-600" />
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-800/60 border border-slate-100/50 dark:border-slate-800/50">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-700/30 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Contact Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          
          {/* Info */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Get in Touch</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Have questions about integrations or enterprise clinic setups? Contact our support staff.</p>
            
            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-sky-600 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-300">Medical Center Plaza, Suite 402, Metropolis</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-sky-600 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-300">support@smartqueuehospital.com</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-sky-600 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-300">+1 (555) 234-5678</span>
              </div>
            </div>
          </div>
          
          {/* Mock Contact Form */}
          <div className="glass shadow-card rounded-3xl p-8 dark:bg-slate-800/40">
            <form onSubmit={(e) => { e.preventDefault(); toast.success('Your query was submitted successfully! We will contact you soon.'); }} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800/40 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800/40 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
                <textarea
                  rows={4}
                  required
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800/40 dark:text-white"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full rounded-xl bg-sky-600 py-3.5 text-center text-sm font-semibold text-white shadow-md hover:bg-sky-500 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Landing;
