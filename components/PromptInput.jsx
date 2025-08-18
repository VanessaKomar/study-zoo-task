const TextInput = ({ placeholder, value, onChange }) => {
  return (
    // TODO move this to the bottom of the screem
    <div className="form-group cs1 ce12">
      <input
        className="input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default TextInput;
