# UI Context

## Aesthetic Principle
**"Clean, Trustworthy, and Professional."**
The UI should feel like a modern healthcare application. It uses a high-contrast design with plenty of whitespace to ensure readability and a sense of hygiene.

## Clinic Branding System
DentalHub allows each clinic (tenant) to inject their own identity into the platform.

### Customization Points
- **Primary Color**: Used for buttons, active states, and brand highlights.
- **Secondary Color**: Used for subtle accents and backgrounds.
- **Clinic Logo**: Displayed in the header and on booking pages.
- **Typography**: Professional sans-serif (defaults to Geist Sans).

## Base Theme (Default)
The default theme is light-based, but supports a professional dark mode if the user's system prefers it.

| Role             | Default Value          | Purpose                                   |
| ---------------- | ---------------------- | ----------------------------------------- |
| Background       | `#FFFFFF` / `#09090B`  | Main page background                      |
| Surface          | `#F9FAFB` / `#18181B`  | Cards and panels                          |
| Primary Brand    | Variable (e.g. Blue)   | Main action color                         |
| Text Primary     | `#111827` / `#FAFAFA`  | High readability for medical info         |
| Text Secondary   | `#4B5563` / `#A1A1AA`  | Labels and secondary info                 |
| Success (States) | `#10B981`              | Confirmed, Completed status               |
| Danger (States)  | `#EF4444`              | Cancelled, No-show status                 |
| Warning (States) | `#F59E0B`              | Rescheduled, Checked-in status            |

## Typography
- **UI Text**: Geist Sans (Clean, modern readability).
- **Data/Time**: Tabular numerals for alignment in schedules.

## Component Patterns
- **Booking Calendar**: Large, clear slots with status indicators.
- **Appointment Cards**: High-density but clear information (Patient, Time, Service).
- **Dashboard Widgets**: Summary stats with clear trend indicators.

## Layout
- **Patient View**: Simple, mobile-first booking funnel.
- **Staff View**: Multi-pane dashboard for schedule management and walk-in queue.
- **Owner View**: Analytical overview and branch management settings.

## Icons
Lucide React. Use medical and scheduling-themed icons (Calendar, Clock, User, Stethoscope, Building).
