import FeedbackMessage from '../../../components/ui/FeedbackMessage';
import Modal from '../../../components/ui/Modal';
import {
  Button,
  ButtonRow,
  FieldInput,
  FieldLabel,
  FieldTitle,
  FormStack,
  MutedText,
} from '../../../components/ui/Primitives.styles';
import styled from 'styled-components';

const SettingsNote = styled(MutedText)`
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #f9fafb;
`;

export default function AppointmentPricingSettingsModal({
  price,
  onPriceChange,
  error,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      description="המחיר הזה ימולא כברירת מחדל בחלונית סיום טיפול. אפשר לשנות אותו לכל טיפול בנפרד."
      onClose={onClose}
      title="הגדרות תמחור"
    >
      {error && (
        <div>
          <FeedbackMessage>{error}</FeedbackMessage>
        </div>
      )}

      <FormStack $gap="1.25rem" onSubmit={onSubmit}>
        <FieldLabel>
          <FieldTitle>
            מחיר ברירת מחדל לדקה (₪)
          </FieldTitle>
          <FieldInput
            autoFocus
            min="0.01"
            onChange={(event) => onPriceChange(event.target.value)}
            required
            step="0.01"
            type="number"
            value={price}
          />
        </FieldLabel>

        <SettingsNote>
          ההגדרה נשמרת בדפדפן הזה בלבד. ניתן להזין תעריף שונה לטיפול יחיד בזמן
          סיומו.
        </SettingsNote>

        <ButtonRow $paddingTop="0.25rem">
          <Button
            $variant="secondary"
            $grow
            onClick={onClose}
            type="button"
          >
            ביטול
          </Button>
          <Button
            $grow
            type="submit"
          >
            שמירת הגדרה
          </Button>
        </ButtonRow>
      </FormStack>
    </Modal>
  );
}
