import FeedbackMessage from '../../../components/ui/FeedbackMessage';
import Modal from '../../../components/ui/Modal';
import {
  Button,
  ButtonRow,
  FieldInput,
  FieldLabel,
  FieldTitle,
  FormStack,
} from '../../../components/ui/Primitives.styles';
import { formatCurrency } from '../../../utils/formatters';
import styled from 'styled-components';

const PriceEstimate = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #f5f3ff;
`;

const PriceEstimateTitle = styled.p`
  margin: 0;
  color: #5b21b6;
  font-size: 0.875rem;
`;

const PriceEstimateCalculation = styled.p`
  margin: 0.25rem 0 0;
  color: #7c3aed;
  font-size: 0.75rem;
`;

const PriceEstimateValue = styled.p`
  margin: 0;
  color: #4c1d95;
  font-size: 1.5rem;
  font-weight: 700;
`;

export default function AppointmentCompletionModal({
  appointment,
  actualDuration,
  onDurationChange,
  pricePerMinute,
  onPriceChange,
  calculatedPrice,
  error,
  isCompleting,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      description={`עדכון משך הטיפול עבור ${appointment.clients?.full_name || 'הלקוח/ה'}.`}
      onClose={onClose}
      title="סיום טיפול"
    >
      {error && (
        <div>
          <FeedbackMessage>{error}</FeedbackMessage>
        </div>
      )}

      <FormStack $gap="1.25rem" onSubmit={onSubmit}>
        <FieldLabel>
          <FieldTitle>
            משך הטיפול בפועל (בדקות)
          </FieldTitle>
          <FieldInput
            autoFocus
            min="1"
            onChange={(event) => onDurationChange(event.target.value)}
            required
            type="number"
            value={actualDuration}
          />
        </FieldLabel>

        <FieldLabel>
          <FieldTitle>
            מחיר לדקה עבור טיפול זה (₪)
          </FieldTitle>
          <FieldInput
            min="0.01"
            onChange={(event) => onPriceChange(event.target.value)}
            required
            step="0.01"
            type="number"
            value={pricePerMinute}
          />
        </FieldLabel>

        <PriceEstimate
          aria-live="polite"
        >
          <div>
            <PriceEstimateTitle>מחיר משוער</PriceEstimateTitle>
            <PriceEstimateCalculation>
              {actualDuration || '0'} דקות ×{' '}
              {formatCurrency(Number(pricePerMinute))} לדקה
            </PriceEstimateCalculation>
          </div>
          <PriceEstimateValue>
            {calculatedPrice == null
              ? '—'
              : `${formatCurrency(calculatedPrice)} ₪`}
          </PriceEstimateValue>
        </PriceEstimate>

        <ButtonRow $paddingTop="0.25rem">
          <Button
            $variant="secondary"
            $grow
            disabled={isCompleting}
            onClick={onClose}
            type="button"
          >
            ביטול
          </Button>
          <Button
            $variant="success"
            $grow
            disabled={isCompleting}
            type="submit"
          >
            {isCompleting ? 'שומר...' : 'אישור סיום טיפול'}
          </Button>
        </ButtonRow>
      </FormStack>
    </Modal>
  );
}
