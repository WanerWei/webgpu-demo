import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = 'default' }) => {
    // 简化版本，实际应该实现完整的toast功能
    console.log(`Toast: ${title} - ${description} (${variant})`);
  };

  return { toast, toasts };
}; 