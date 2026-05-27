import "@testing-library/jest-dom";
import { TextEncoder } from "text-encoding";

(globalThis as any).TextEncoder = TextEncoder;