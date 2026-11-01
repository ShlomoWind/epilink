import { Calendar, Users } from 'lucide-react';
import { NavigationTab, TabsContainer } from './NavigationTabs.styles';

const NAVIGATION_ITEMS = [
  { id: 'appointments', label: 'לוח תורים', Icon: Calendar },
  { id: 'clients', label: 'רשימת לקוחות', Icon: Users },
];

export default function NavigationTabs({ activeTab, onTabChange }) {
  return (
    <TabsContainer aria-label="ניווט ראשי">
      {NAVIGATION_ITEMS.map(({ id, label, Icon }) => (
        <NavigationTab
          key={id}
          $active={activeTab === id}
          aria-current={activeTab === id ? 'page' : undefined}
          onClick={() => onTabChange(id)}
          type="button"
        >
          <Icon size={18} />
          {label}
        </NavigationTab>
      ))}
    </TabsContainer>
  );
}
