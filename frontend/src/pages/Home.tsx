import { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaChartLine, FaDatabase, FaMobileAlt } from 'react-icons/fa';
import { RiPlantLine } from 'react-icons/ri';
import { GiPlantRoots } from 'gi-icons/gi';

interface FeatureCard {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface Statistic {
  value: string;
  label: string;
}

const Home: FC = () => {
  const features: FeatureCard[] = [
    {
      icon: <FaLeaf className="w-8 h-8 text-green-500" />,
      title: "Real-time Monitoring",
      description: "Track soil conditions and plant health metrics in real-time"
    },
    {
      icon: <FaChartLine className="w-8 h-8 text-green-500" />,
      title: "Data Analytics",
      description: "Advanced analytics and insights for better farming decisions"
    },
    {
      icon: <FaMobileAlt className="w-8 h-8 text-green-500" />,
      title: "Mobile Access",
      description: "Access your dashboard anywhere, anytime on any device"
    }
  ];

  const stats: Statistic[] = [
    { value: "10K+", label: "Active Users" },
    { value: "1M+", label: "Data Points Collected" },
    { value: "95%", label: "Accuracy Rate" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-br from-green-50 to-green-100 py-20 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Plant Health Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Empowering farmers with data-driven insights for optimal crop management
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/dashboard" className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors">
                Get Started
              </Link>
              <Link to="/demo" className="bg-white text-green-500 px-8 py-3 rounded-lg border border-green-500 hover:bg-green-50 transition-colors">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-500 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-green-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Entity Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Monitor Your Metrics</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center mb-4">
              <GiPlantRoots className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-2xl font-semibold">Soil Metrics</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Track essential soil parameters including moisture levels, pH balance, 
              nutrient content, and temperature in real-time.
            </p>
            <Link 
              to="/soil-metrics"
              className="inline-flex items-center text-green-500 hover:text-green-600"
            >
              View Soil Metrics
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;