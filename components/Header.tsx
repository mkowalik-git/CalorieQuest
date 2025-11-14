import React from 'react';
import { NavigationTab } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { TargetIcon } from './icons/TargetIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

const tabIcons: Record<NavigationTab, React.FC<React.SVGProps<SVGSVGElement>>> = {
  [NavigationTab.Tracker]: ClipboardIcon,
  [NavigationTab.Planner]: CalendarDaysIcon,
  [NavigationTab.Database]: BookOpenIcon,
  [NavigationTab.Goals]: TargetIcon,
  [NavigationTab.Chat]: ChatBubbleIcon,
};

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = Object.values(NavigationTab);

  return (
    <header className="bg-base-200 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-4">
          <div className="flex items-center text-2xl font-bold text-neutral mb-4 md:mb-0">
            <SparklesIcon className="w-8 h-8 text-brand mr-2"/>
            CalorieQuest
            <button
              onClick={() => {
                localStorage.removeItem('onboardingComplete');
                window.location.reload();
              }}
              className="ml-4 text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              title="Reset Onboarding"
            >
              Reset
            </button>
          </div>
          <nav className="flex flex-wrap justify-center space-x-1 sm:space-x-2 bg-base-300 p-1 rounded-full">
            {tabs.map((tab) => {
              const Icon = tabIcons[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base font-medium rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                    activeTab === tab
                      ? 'bg-gradient-brand text-primary-content shadow-lg'
                      : 'text-neutral hover:bg-base-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
