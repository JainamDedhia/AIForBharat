import { motion } from 'framer-motion';
import Card from '../components/Card';

export default function History() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-12">
        <div className="text-center">
          <p className="text-[14px] text-[#888888]">Your analysis and dubbing history will appear here</p>
        </div>
      </Card>
    </motion.div>
  );
}
