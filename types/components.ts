import React from 'react';
import { ViewProps } from 'react-native';

// Component props interfaces

// Button components
export interface ButtonProps {
  // TODO: Button.tsx'teki 'any' type'ını düzeltmek gerekiyor
  [key: string]: any;
}

export interface ButtonListProps extends ViewProps {
  children: React.ReactNode;
}

// Header components
export interface PageHeaderProps {
  title: string;
  onRightButtonPress?: () => void;
  rightIconText?: string;
  backgroundColor?: string;
}

export interface HeaderProps {
  name: string;
  profileImage: string;
  onSearchPress?: () => void;
}

// Input components
export interface DatePickerInputProps {
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  label: string;
  className?: string;
}

export interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  color?: string;
}

// Task components
export interface AddTaskButtonProps {
  onAddTask: (taskName: string, description?: string, dueDate?: string) => void;
  backgroundColor?: string;
}

// Layout components
export interface SwipableButtonProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit?: () => void;
}

export interface ScreenContentProps {
  title: string;
  path: string;
  children?: React.ReactNode;
}

// Provider components
export interface DatabaseProviderProps {
  children: React.ReactNode;
}
