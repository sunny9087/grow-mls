import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Crown,
  Star,
  CheckCircle,
  X,
  Zap,
  Shield,
  Users,
  BookOpen,
  Video,
  Download,
  MessageCircle,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  Infinity,
  Calendar,
  CreditCard,
  Gift,
  Target,
  BarChart3,
  Headphones,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  Play,
  Lock,
  Unlock,
} from "lucide-react";

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [showComparison, setShowComparison] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const courseId = searchParams.get("course");

  const plans = [
    {
      id: "monthly",
      name: "Monthly Pro",
      price: 100,
      originalPrice: 150,
      currency: "₹",
      period: "/month",
      description: "Perfect for getting started",
      popular: false,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Access to all premium courses",
        "HD video streaming",
        "Mobile app access",
        "Basic support",
        "Course certificates",
        "Download for offline viewing",
      ],
      limitations: [
        "Monthly billing",
        "Standard support response time",
      ]
    },
    {
      id: "yearly",
      name: "Yearly Master",
      price: 1000,
      originalPrice: 1800,
      currency: "₹",
      period: "/year",
      description: "Most popular choice - Save 44%",
      popular: true,
      color: "from-emerald-500 to-blue-500",
      badge: "BEST VALUE",
      features: [
        "Everything in Monthly Pro",
        "2 months free (14 months total)",
        "Priority support",
        "Exclusive masterclasses",
        "Advanced analytics",
        "Group study sessions",
        "Direct mentor chat",
        "Resume review sessions",
      ],
      limitations: []
    },
    {
      id: "lifetime",
      name: "Lifetime Legend",
      price: 5000,
      originalPrice: 15000,
      currency: "₹",
      period: "one-time",
      description: "Ultimate investment in your future",
      popular: false,
      color: "from-amber-500 to-orange-500",
      badge: "LIMITED TIME",
      features: [
        "Everything in Yearly Master",
        "Lifetime access to all content",
        "Future courses included",
        "VIP community access",
        "1-on-1 coaching sessions",
        "Personal portfolio review",
        "Job placement assistance",
        "Exclusive trading signals",
        "Annual live workshops",
        "Lifetime updates",
      ],
      limitations: []
    }
  ];

  const features = [
    {
      icon: BookOpen,
      title: "200+ Expert Courses",
      description: "Comprehensive curriculum covering stocks, crypto, options, and more"
    },
    {
      icon: Video,
      title: "HD Video Content",
      description: "Crystal clear 4K videos with professional production quality"
    },
    {
      icon: Download,
      title: "Offline Access",
      description: "Download courses for learning anywhere, anytime"
    },
    {
      icon: MessageCircle,
      title: "Expert Mentorship",
      description: "Direct access to industry professionals and trading experts"
    },
    {
      icon: Award,
      title: "Certificates",
      description: "Industry-recognized certificates to boost your career"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track your progress with detailed learning analytics"
    },
    {
      icon: Shield,
      title: "Risk-Free",
      description: "30-day money-back guarantee on all plans"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock premium customer support"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Software Engineer → Full-time Trader",
      content: "MLS transformed my understanding of markets. I went from zero knowledge to profitable trading in 6 months!",
      rating: 5,
      avatar: "RK"
    },
    {
      name: "Priya Sharma",
      role: "Student → Investment Analyst",
      content: "The courses are incredibly detailed. I landed my dream job at a top investment firm thanks to MLS certification.",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Amit Patel",
      role: "Business Owner",
      content: "Best investment I ever made. The portfolio optimization course alone saved me ₹2 lakhs in losses.",
      rating: 5,
      avatar: "AP"
    }
  ];

  const handlePurchase = async (plan) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Here you would integrate with your payment gateway
      alert(`Processing ${plan.name} subscription for ${plan.currency}${plan.price}...`);
      // navigate('/dashboard'); // Redirect after successful payment
    }, 2000);
  };

  const calculateSavings = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return 0;
    return Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16 space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 rounded-full border border-amber-500/20 backdrop-blur-sm">
            <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-amber-400 font-semibold">Unlock Premium Learning</span>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white">
              Choose Your <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">Success</span> Plan
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Join <span className="font-bold text-emerald-400">50,000+ learners</span> who've transformed their financial future with our 
              <span className="font-bold text-amber-400"> premium courses</span>
            </p>
          </div>

          {courseId && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-emerald-400 font-medium">
                🎯 You're subscribing to access Course #{courseId}
              </p>
            </div>
          )}
        </section>

        {/* Pricing Plans */}
        <section className="mb-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const savings = calculateSavings(plan.id);
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-slate-900/70 backdrop-blur-md rounded-3xl border-2 p-8 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    isSelected
                      ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/20'
                      : plan.popular
                      ? 'border-emerald-500/30 shadow-xl shadow-emerald-500/10'
                      : 'border-slate-700/50 hover:border-slate-600/50'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {/* Limited Time Badge */}
                  {plan.badge === "LIMITED TIME" && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                        <Zap className="w-4 h-4" />
                        {plan.badge}
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${plan.color} bg-opacity-20 flex items-center justify-center`}>
                      {plan.id === 'lifetime' && <Crown className="w-10 h-10 text-amber-400" />}
                      {plan.id === 'yearly' && <Star className="w-10 h-10 text-emerald-400" />}
                      {plan.id === 'monthly' && <Zap className="w-10 h-10 text-blue-400" />}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-slate-400 mb-4">{plan.description}</p>

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-slate-400 line-through text-lg">
                          {plan.currency}{plan.originalPrice}
                        </span>
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm font-bold">
                          -{savings}%
                        </span>
                      </div>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-black text-white">
                          {plan.currency}{plan.price}
                        </span>
                        <span className="text-slate-400 ml-1">{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-start gap-3 opacity-60">
                        <X className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(plan);
                    }}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg'
                        : plan.id === 'lifetime'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Get Started Now
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {/* Money Back Guarantee */}
                  <div className="text-center mt-4">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                      <Shield className="w-4 h-4" />
                      30-day money-back guarantee
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Toggle */}
          <div className="text-center mt-12">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              {showComparison ? 'Hide' : 'Show'} Detailed Comparison
              <ArrowRight className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        {showComparison && (
          <section className="mb-20 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Feature Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-4 text-slate-300">Feature</th>
                      <th className="text-center py-4 text-blue-400">Monthly</th>
                      <th className="text-center py-4 text-emerald-400">Yearly</th>
                      <th className="text-center py-4 text-amber-400">Lifetime</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { feature: "Premium Courses Access", monthly: true, yearly: true, lifetime: true },
                      { feature: "HD Video Streaming", monthly: true, yearly: true, lifetime: true },
                      { feature: "Mobile App", monthly: true, yearly: true, lifetime: true },
                      { feature: "Offline Downloads", monthly: true, yearly: true, lifetime: true },
                      { feature: "Certificates", monthly: true, yearly: true, lifetime: true },
                      { feature: "Priority Support", monthly: false, yearly: true, lifetime: true },
                      { feature: "Exclusive Masterclasses", monthly: false, yearly: true, lifetime: true },
                      { feature: "1-on-1 Coaching", monthly: false, yearly: false, lifetime: true },
                      { feature: "Job Placement Help", monthly: false, yearly: false, lifetime: true },
                      { feature: "Trading Signals", monthly: false, yearly: false, lifetime: true },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-800">
                        <td className="py-4 text-slate-300">{row.feature}</td>
                        <td className="text-center py-4">
                          {row.monthly ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-4">
                          {row.yearly ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-4">
                          {row.lifetime ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Features Grid */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Why Choose MLS Premium?</h2>
            <p className="text-slate-400 text-lg">Unlock the complete learning experience</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/30 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Success Stories</h2>
            <p className="text-slate-400 text-lg">What our premium members are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-slate-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
              },
              {
                q: "Is there a mobile app?",
                a: "Absolutely! Our mobile app is available for both iOS and Android, allowing you to learn on the go with offline downloads."
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund."
              },
              {
                q: "How often is new content added?",
                a: "We add new courses and update existing content monthly. Premium members get early access to all new releases."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-16 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl border border-emerald-500/20 backdrop-blur-sm">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Ready to Transform Your Future?
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Join thousands of successful learners who've already upgraded their financial knowledge with MLS Premium.
            </p>
            <button
              onClick={() => {
                const yearlyPlan = plans.find(p => p.id === 'yearly');
                handlePurchase(yearlyPlan);
              }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
            >
              <Crown className="w-6 h-6" />
              Start Your Journey Today
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}