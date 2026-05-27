import { render, screen, fireEvent } from "@testing-library/react";

function MockForm() {
  return (
    <form>
      <input placeholder="Item Name" />
      <button type="submit">Submit</button>
    </form>
  );
}

test("user can fill form input", () => {
  render(<MockForm />);

  const input = screen.getByPlaceholderText("Item Name");

  fireEvent.change(input, {
    target: { value: "Water Bottle" },
  });

  expect(input).toHaveValue("Water Bottle");
});