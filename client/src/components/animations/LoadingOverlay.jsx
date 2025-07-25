// components/LoadingOverlay.jsx
import { motion } from 'framer-motion';

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const LoadingOverlay = () => (
  <motion.div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    variants={overlayVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.4 }}
  >
    <div className="text-white text-xl font-bold animate-pulse">Loading...</div>
  </motion.div>
);

export default LoadingOverlay;
