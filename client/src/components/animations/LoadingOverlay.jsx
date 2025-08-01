// components/LoadingOverlay.jsx
import { motion } from 'framer-motion';

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const LoadingOverlay = () => (
  <motion.div
    className="fixed inset-0 z-[9999] flex flex-col gap-4 items-center justify-center bg-black/80 backdrop-blur-sm"
    variants={overlayVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.4 }}
  >
    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    <p className="text-white text-lg font-semibold animate-pulse">Loading...</p>
  </motion.div>
);

export default LoadingOverlay;
