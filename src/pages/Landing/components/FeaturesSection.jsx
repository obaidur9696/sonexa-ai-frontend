import { memo } from 'react';
import { motion } from 'framer-motion';
import { FEATURES } from './landingConstants';

const FeaturesSection = memo(() => (
  <section id="features" className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pb-10 pt-16 dark:from-gray-950 dark:to-gray-900 sm:pb-14 sm:pt-24 lg:pb-16 lg:pt-28">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-500/10" />
    </div>
    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Why Sonexa AI</p>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
          Built for <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">real conversations</span>
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">Everything you need to have meaningful, natural, and intelligent voice conversations.</p>
      </motion.div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {FEATURES.map((feature, index) => (
          <motion.article key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-white/6 dark:bg-gray-900/60 sm:p-7">
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.045]`} />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 text-2xl transition-transform duration-300 group-hover:scale-105 dark:from-indigo-500/10 dark:to-purple-500/10">{feature.icon}</div>
              <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{feature.description}</p>
              {feature.note && <p className="mt-4 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-xs font-medium leading-relaxed text-indigo-700 dark:border-indigo-400/15 dark:bg-indigo-400/10 dark:text-indigo-200"><span aria-hidden="true" className="mt-0.5">✦</span><span>{feature.note}</span></p>}
            </div>
            <div className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${feature.gradient} transition-transform duration-300 group-hover:scale-x-100`} />
          </motion.article>
        ))}
      </div>
    </div>
  </section>
));

FeaturesSection.displayName = 'FeaturesSection';
export default FeaturesSection;
