// import { createStackNavigator } from '@react-navigation/stack';
// import { HomeScreen } from '../screens/Home/HomeScreen';
// import { WishlistScreen } from '../screens/Wishlist/WishlistScreen';
// import { CreateWishlistScreen } from '../screens/Wishlist/CreateWishlistScreen';
// import { ProfileScreen } from '../screens/Profile/ProfileScreen';

// // Типы для навигации (для TypeScript)
// export type AppStackParamList = {
//   Home: undefined;
//   Wishlist: { wishlistId: string; title?: string };
//   CreateWishlist: undefined;
//   Profile: undefined;
// };

// const Stack = createStackNavigator<AppStackParamList>();

// export function AppNavigator() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: '#fff',
//         },
//         headerTitleStyle: {
//           fontWeight: '600',
//         },
//         headerBackTitle: 'Назад',
//       }}
//     >
//       {/* Главный экран со списком вишлистов */}
//       <Stack.Screen 
//         name="Home" 
//         component={HomeScreen} 
//         options={{ 
//           title: 'Мои вишлисты',
//           headerRight: () => null // пока пусто, потом добавим кнопку профиля
//         }}
//       />
      
//       {/* Экран вишлиста (список подарков) */}
//       <Stack.Screen 
//         name="Wishlist" 
//         component={WishlistScreen} 
//         options={({ route }) => ({ 
//           title: route.params?.title || 'Вишлист'
//         })}
//       />
      
//       {/* Экран создания вишлиста */}
//       <Stack.Screen 
//         name="CreateWishlist" 
//         component={CreateWishlistScreen} 
//         options={{ 
//           title: 'Создать вишлист',
//           presentation: 'modal'  // открывается как модальное окно
//         }}
//       />
      
//       {/* Экран профиля */}
//       <Stack.Screen 
//         name="Profile" 
//         component={ProfileScreen} 
//         options={{ 
//           title: 'Профиль'
//         }}
//       />
//     </Stack.Navigator>
//   );
// }
