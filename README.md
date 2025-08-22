# PaySync - Offline-First Payment App

A modern payment application with offline capabilities, NFC support, and real-time synchronization.

## 🚀 Features

- **Offline Payments**: Make transactions even without internet connection
- **NFC Support**: Send and receive payment data via NFC
- **QR Code Payments**: Generate QR codes for quick payments
- **Real-time Sync**: Automatic sync when back online
- **Dashboard**: Beautiful analytics and transaction history
- **Secure Authentication**: User authentication with session management
- **Split Payments**: Divide payments among multiple people
- **Payment Reminders**: Set recurring payment reminders

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase
- **UI Components**: Radix UI + shadcn/ui
- **Routing**: React Router
- **NFC**: Web NFC API

## 🎯 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Atharva9605/sync-wave-vault.git
   cd sync-wave-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

## 📱 How to Use

1. **Sign Up/Login**: Create an account or login
2. **Make Payment**: Enter amount and recipient UPI ID
3. **Offline Mode**: App works even without internet
4. **NFC Transfer**: Use NFC to share transaction data
5. **QR Payments**: Generate QR codes for payments
6. **Split Payments**: Divide bills among friends
7. **Set Reminders**: Never miss recurring payments
8. **View Dashboard**: Track all your transactions

## 🔧 Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📊 App Structure

```
src/
├── components/        # React components
├── pages/            # Route pages
├── store/            # Zustand stores
├── lib/              # Utility functions
├── hooks/            # Custom hooks
└── integrations/     # Third-party integrations
```

## 🌟 Key Components

- **Dashboard**: Main app interface with transaction history
- **TransactionForm**: Create new payments
- **NFCHandler**: NFC read/write functionality
- **QRView**: QR code generation and scanning
- **AuthForm**: User authentication
- **SplitPayment**: Split bills among multiple people
- **PaymentReminders**: Set and manage recurring reminders

## 🚧 Roadmap

- [x] Split payments
- [x] Payment reminders
- [ ] Biometric authentication
- [ ] Multiple currency support
- [ ] Recurring payments
- [ ] Advanced analytics
- [ ] Group expense tracking
- [ ] Budget management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ using modern web technologies