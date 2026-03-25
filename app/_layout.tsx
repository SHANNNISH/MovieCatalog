import { Stack } from "expo-router";
// 1. Импортируем нужные штуки
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 2. Создаем экземпляр клиента (это «мозг», который хранит кэш)
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </QueryClientProvider>
  );
}
