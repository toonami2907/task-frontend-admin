
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "@/context/motion";

const HomePage = () => {
  return (
    <section>
      <div className="h-[calc(100vh-57px)] text-neutral-950  flex flex-col items-center justify-center">
      <div
          className="absolute left-10 top-0 h-[300px] w-[300px] animate-pulse rounded-full bg-gradient-to-br from-pink-100 via-purple-100 to-purple-200 opacity-70 blur-3xl"
          aria-hidden="true"
        />
      <div
          className="absolute left-[700px] top-0 h-[300px] w-[300px] animate-pulse rounded-full bg-gradient-to-br from-pink-100 via-purple-100 to-purple-200 opacity-70 blur-3xl"
          aria-hidden="true"
        />
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
            <motion.h1 
           variants={textVariant(0.5)} // 0.5 second delay
           initial="hidden"
           whileInView="show"
           viewport={{ once: true, amount: 0.25 }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900"
            >
            Timely reminders, productive teams
            </motion.h1>
            <motion.p
            variants={textVariant(0.5)} // 0.5 second delay
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="text-center text-md md:text-lg font-semibold text-gray-700"
            >
            Keep your team on track with automated task reminders that boost productivity. Get real-time alerts, simplify task management, and ensure deadlines are met. Stay organized, maximize efficiency, and keep your workforce focused with timely notifications.
            </motion.p>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
