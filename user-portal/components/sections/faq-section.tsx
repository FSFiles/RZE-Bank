"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/constants/testimonials";
import { SectionHeading } from "@/components/section-heading";

export function FaqSection() {
  return (
    <section className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know before you get started"
        />

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_ITEMS.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
