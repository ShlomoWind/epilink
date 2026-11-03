import styled, { css } from 'styled-components';
import { LoaderCircle } from 'lucide-react';

const buttonVariants = {
  primary: css`
    border: 1px solid #6d28d9;
    background: #6d28d9;
    color: #ffffff;

    &:hover:not(:disabled) {
      border-color: #5b21b6;
      background: #5b21b6;
    }
  `,
  secondary: css`
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #374151;

    &:hover:not(:disabled) {
      background: #f9fafb;
    }
  `,
  danger: css`
    border: 1px solid #b91c1c;
    background: #b91c1c;
    color: #ffffff;

    &:hover:not(:disabled) {
      border-color: #991b1b;
      background: #991b1b;
    }
  `,
  dangerOutline: css`
    border: 1px solid #fecaca;
    background: #ffffff;
    color: #b91c1c;

    &:hover:not(:disabled) {
      background: #fef2f2;
    }
  `,
  success: css`
    border: 1px solid #047857;
    background: #047857;
    color: #ffffff;

    &:hover:not(:disabled) {
      border-color: #065f46;
      background: #065f46;
    }
  `,
  violetOutline: css`
    border: 1px solid #ddd6fe;
    background: #ffffff;
    color: #5b21b6;

    &:hover:not(:disabled) {
      background: #f5f3ff;
    }
  `,
};

export const PageContainer = styled.section`
  width: min(100%, 72rem);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.$gap || '1.5rem'};
`;

export const PageHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

export const PageIntro = styled.div``;

export const Eyebrow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #6d28d9;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const PageTitle = styled.h1`
  margin: 0;
  color: #111827;
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.25;
`;

export const PageDescription = styled.p`
  margin: 0.5rem 0 0;
  color: #4b5563;
`;

export const ActionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const Button = styled.button`
  display: inline-flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: ${(props) => (props.$grow ? '1 1 0%' : '0 0 auto')};
  padding: ${(props) => (props.$compact ? '0.5rem 0.75rem' : '0.75rem 1rem')};
  border: 1px solid transparent;
  border-radius: 0.75rem;
  font-size: ${(props) => (props.$compact ? '0.875rem' : '1rem')};
  font-weight: 600;
  line-height: 1.25rem;
  text-align: center;
  cursor: pointer;
  box-shadow: ${(props) => (props.$shadow ? '0 1px 2px rgb(0 0 0 / 0.08)' : 'none')};
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
  ${(props) => buttonVariants[props.$variant || 'primary']}

  &:focus-visible {
    outline: 2px solid #8b5cf6;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 639px) {
    ${(props) => props.$mobileFullWidth && 'width: 100%;'}
  }
`;

export const Panel = styled.section`
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
`;

export const CountBadge = styled.span`
  flex: 0 0 auto;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: #f5f3ff;
  color: #6d28d9;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const SearchLabel = styled.label`
  position: relative;
  display: block;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
`;

export const SearchIcon = styled.span`
  position: absolute;
  top: 50%;
  right: 2rem;
  display: flex;
  color: #9ca3af;
  transform: translateY(-50%);
  pointer-events: none;
`;

export const TextInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: ${(props) => (props.$search ? '0.75rem 2.75rem 0.75rem 1rem' : '0.75rem 1rem')};
  border: 1px solid ${(props) => (props.$readOnly ? '#e5e7eb' : '#d1d5db')};
  border-radius: 0.75rem;
  outline: none;
  background: ${(props) => (props.$readOnly ? '#f9fafb' : '#ffffff')};
  color: ${(props) => (props.$readOnly ? '#6b7280' : '#111827')};
  text-align: ${(props) => (props.$align === 'left' ? 'left' : 'inherit')};
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgb(237 233 254 / 0.9);
  }
`;

export const ScrollableGrid = styled.div`
  display: grid;
  max-height: ${(props) => props.$maxHeight || '27.5rem'};
  grid-template-columns: 1fr;
  gap: 1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const LoadingState = styled.div`
  display: flex;
  min-height: 10rem;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  color: #6b7280;
  text-align: center;
  ${(props) =>
    props.$boxed &&
    css`
      border: 1px solid #e5e7eb;
      border-radius: 1rem;
      background: #ffffff;
    `}
`;

export const LoadingIcon = styled(LoaderCircle)`
  flex: 0 0 auto;
  color: #6d28d9;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const EmptyState = styled.div`
  padding: 4rem 1.5rem;
  color: #6b7280;
  text-align: center;
`;

export const EmptyIcon = styled.div`
  display: flex;
  justify-content: center;
  color: #d1d5db;
`;

export const EmptyTitle = styled.p`
  margin: 0.75rem 0 0;
  color: #374151;
  font-weight: 500;
`;

export const EmptyDescription = styled.p`
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.875rem;
`;

export const FormStack = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FieldLabel = styled.label`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.375rem;
`;

export const FieldTitle = styled.span`
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const FieldHint = styled.span`
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.5;
`;

export const FieldInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  outline: none;
  background: #ffffff;
  color: #111827;

  &:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgb(237 233 254 / 0.9);
  }
`;

export const FieldSelect = styled.select`
  width: 100%;
  min-width: 0;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  outline: none;
  background: #ffffff;
  color: #111827;

  &:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgb(237 233 254 / 0.9);
  }
`;

export const FieldTextarea = styled.textarea`
  width: 100%;
  min-width: 0;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  outline: none;
  background: #ffffff;
  color: #111827;

  &:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgb(237 233 254 / 0.9);
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  padding-top: ${(props) => props.$paddingTop || '0.5rem'};

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

export const MutedText = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: ${(props) => (props.$small ? '0.75rem' : '0.875rem')};
  line-height: 1.6;
`;

export const TabList = styled.div`
  display: inline-flex;
  padding: 0.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
`;

export const TabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: ${(props) => (props.$active ? '#6d28d9' : 'transparent')};
  color: ${(props) => (props.$active ? '#ffffff' : '#4b5563')};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? '#5b21b6' : '#f9fafb')};
  }

  &:focus-visible {
    outline: 2px solid #8b5cf6;
    outline-offset: 2px;
  }
`;

export const InlineCount = styled.span`
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: rgb(0 0 0 / 0.1);
  font-size: 0.75rem;
`;

export const ContentStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.$gap || '1.25rem'};
`;

export const SurfaceCard = styled.div`
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
`;
