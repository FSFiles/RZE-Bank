"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NEWS_ARTICLES } from "@/lib/constants/news";

export function NewsSection() {
  return (
    <section className="relative py-24">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <span className="section-eyebrow">Financial News</span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Stay Informed, Stay Ahead
            </h2>
          </div>
          <Button variant="secondary">
            View All News
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {NEWS_ARTICLES.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group flex flex-col rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30"
            >
              <Badge variant="secondary" className="w-fit">
                {article.category}
              </Badge>
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-white">
                {article.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                {article.summary}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-500">
                <span>
                  {article.date} · {article.readTime}
                </span>
                <span className="flex items-center gap-1 font-semibold text-blue-400 transition-transform group-hover:translate-x-1">
                  Read More
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
