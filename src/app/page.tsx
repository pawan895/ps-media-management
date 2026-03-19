import Link from 'next/link'
import { ArrowRight, Cloud, Server, Cog, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PS</span>
              </div>
              <span className="text-white font-bold text-xl">PS Media</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#services" className="text-slate-300 hover:text-white transition">Services</a>
              <a href="#about" className="text-slate-300 hover:text-white transition">About</a>
              <a href="#portfolio" className="text-slate-300 hover:text-white transition">Portfolio</a>
              <a href="#contact" className="text-slate-300 hover:text-white transition">Contact</a>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/client/login" 
                className="text-slate-300 hover:text-white transition px-4 py-2"
              >
                Client Login
              </Link>
              <Link 
                href="/admin/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Scale Your Infrastructure
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              With Confidence
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Enterprise-grade AI integration, Kubernetes orchestration, and infrastructure automation 
            that grows with your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contact" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition inline-flex items-center justify-center"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a 
              href="#portfolio" 
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition"
            >
              View Our Work
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Our Services</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            From AI integration to infrastructure automation, we deliver solutions that scale.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* AI Integration */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-blue-500 transition">
              <div className="w-14 h-14 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <Cloud className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Integration at Scale</h3>
              <p className="text-slate-400 mb-6">
                Deploy production-ready AI solutions with enterprise-grade reliability. 
                From LLM integrations to custom ML pipelines.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Custom AI model deployment</span>
                </li>
                <li className="flex items-start text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>LLM API integration & optimization</span>
                </li>
                <li className="flex items-start text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Vector databases & RAG systems</span>
                </li>
              </ul>
            </div>

            {/* Kubernetes */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-purple-500 transition">
              <div className="w-14 h-14 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6">
                <Server className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Kubernetes & Orchestration</h3>
              <p className="text-slate-400 mb-6">
                Build resilient, self-healing infrastructure that scales automatically. 
                Expert K8s architecture and management.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Cluster setup & optimization</span>
                </li>
                <li className="flex items-start text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>CI/CD pipeline automation</span>
                </li>
                <li className="flex items-start text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>GitOps & infrastructure as code</span>
                </li>
              </ul>
            </div>

            {/* Infrastructure Automation */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-green-500 transition">
              <div className="w-14 h-14 bg-green-500/10 rounded-lg flex items-center justify-center mb-6">
                <Cog className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Infrastructure Automation</h3>
              <p className="text-slate-400 mb-6">
                Ansible, Terraform, and custom automation solutions. 
                Eliminate manual work and reduce human error.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Terraform infrastructure provisioning</span>
                </li>
                <li className="flex items-start text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ansible playbooks & automation</span>
                </li>
                <li className="flex items-start text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Configuration management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">About PS Media</h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            We're a specialized team focused on helping businesses scale their infrastructure 
            with modern DevOps practices and AI integration. With expertise in Kubernetes, 
            Terraform, Ansible, and cutting-edge AI technologies, we deliver solutions that 
            are reliable, scalable, and maintainable.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Get In Touch</h2>
          <p className="text-slate-400 text-center mb-12">
            Ready to scale your infrastructure? Let's talk about your project.
          </p>
          
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 mb-2">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-slate-300 mb-2">Company</label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="Your company"
              />
            </div>
            
            <div>
              <label className="block text-slate-300 mb-2">Message</label>
              <textarea 
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition resize-none"
                placeholder="Tell us about your project..."
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>&copy; 2026 PS Media. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
