interface SubmitButtonProps {
  label: string;
  isLoading: boolean;
  onClick: () => void;
}

const SubmitButton = ({ label, isLoading, onClick }: SubmitButtonProps) => (
  <button
    type="button"
    className="btn btn-lg pull-xs-right btn-primary"
    disabled={isLoading}
    onClick={onClick}
  >
    {label}
  </button>
);

export default SubmitButton;
