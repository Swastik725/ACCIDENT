import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    title: "Data Collection",
    description: "Collecting ADAS alert data points from across the road network, including FCW, PCW, and LDW alerts.",
    icon: (
      <svg className="w-12 h-12 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    )
  },
  {
    title: "K-Means Partitioning",
    description: "The Lloyd's algorithm iteratively partitions thousands of alerts into 'K' distinct geographic clusters.",
    icon: (
      <svg className="w-12 h-12 text-moderate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    title: "Centroid Calculation",
    description: "Computing the mathematical mean of each cluster to identify precise hotspots of recurring driver alerts.",
    icon: (
      <svg className="w-12 h-12 text-severe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: "Zone Identification",
    description: "Final clusters are validated against past accident records to identify high-risk 'Blackspots'.",
    icon: (
      <svg className="w-12 h-12 text-low" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.034L3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-.382-3.016z" />
      </svg>
    )
  }
];

export default function AlgorithmExplainer({ onExploreMap }) {
  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16">
          <h2 className="text-3xl font-semibold mb-4 tracking-tight">How It Works</h2>
          <p className="text-white/50 max-w-2xl leading-relaxed">
            Our identification engine utilizes the K-Means clustering algorithm to turn millions of individual ADAS data points into actionable insights for city road safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="mb-6">{step.icon}</div>
              <h3 className="text-lg font-medium mb-3">{step.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button
            onClick={onExploreMap}
            className="px-8 py-3 bg-highlight hover:bg-highlight/80 text-white rounded-full font-medium transition-all"
          >
            See Clustering in Action
          </button>
        </div>
      </div>
    </section>
  );
}
