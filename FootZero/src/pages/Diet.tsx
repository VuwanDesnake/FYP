import DynamicCalculator from "@/components/DynamicCalculator";

const Diet = () => (
  <DynamicCalculator
    category="diet"
    title="Diet"
    description="Select your meal type and the number of meals."
    quantityLabel="Number of meals"
  />
);

export default Diet;
