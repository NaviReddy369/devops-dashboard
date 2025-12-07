import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';

const Services = () => {
  const services = [
    { name: 'DevOps Dashboard', path: '/services/devops-dashboard', description: 'Numerology-inspired insights experience.' },
    { name: 'About', path: '/about', description: 'Learn more about our mission and approach.' },
    { name: 'Contact', path: '/contact', description: 'Get in touch with the team.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Briefcase className="w-6 h-6 text-purple-300" />
          <h1 className="text-3xl font-bold">Services</h1>
        </div>
        <div className="grid gap-4">
          {services.map((service) => (
            <Link
              key={service.path}
              to={service.path}
              className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between hover:border-purple-400/50 transition"
            >
              <div>
                <div className="text-xl font-semibold text-purple-100">{service.name}</div>
                <p className="text-purple-200 text-sm mt-1">{service.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
