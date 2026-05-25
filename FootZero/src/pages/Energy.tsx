import DynamicCalculator from "@/components/DynamicCalculator";

const Energy = () => (
  <DynamicCalculator
    category="energy"
    title="Energy"
    description="Select your energy source and enter your usage."
    quantityLabel="Usage"
  />
);

export default Energy;
