import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface BreadcrumbsProps {
  items: {
    label: string;
    path?: string;
  }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return null;
}
