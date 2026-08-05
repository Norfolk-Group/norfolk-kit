import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusCard } from "./StatusCard";

const meta = {
  title: "Reference/StatusCard",
  component: StatusCard,
  parameters: { layout: "centered" },
  args: { subject: "Product OS", status: "ready" },
} satisfies Meta<typeof StatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
export const Loading: Story = { args: { status: "loading" } };
export const Error: Story = { args: { status: "error" } };
