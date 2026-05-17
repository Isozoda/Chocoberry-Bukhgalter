import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { authApi } from '../../api/auth.api'
import { useAuthStore } from '../../store/auth.store'
import { TextInput } from '../../components/ui/TextInput'
import { Button } from '../../components/ui/Button'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { AuthStackParamList } from '../../navigation/types'

const schema = z.object({
  name: z.string().min(2, 'Ном ҳадди ақал 2 аломат'),
  email: z.string().email('Почтаи дуруст ворид кунед'),
  password: z.string().min(6, 'Рамз ҳадди ақал 6 аломат'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Рамзҳо мувофиқ нестанд', path: ['confirmPassword'],
})
type Form = z.infer<typeof schema>

export function RegisterScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>()
  const { login } = useAuthStore()

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (d: Form) => authApi.register({ name: d.name, email: d.email, password: d.password }),
    onSuccess: async (data) => {
      await login(data.accessToken, data.user)
      Toast.show({ type: 'success', text1: 'Ба қайд гирифта шудед!' })
    },
  })

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Аккаунт созед</Text>
          <Text style={styles.subtitle}>Барои Choco Berry ба қайд гиред</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fields}>
            <Controller
              control={control} name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Ном" value={value} onChangeText={onChange}
                  placeholder="Исми шумо" error={errors.name?.message}
                  autoCapitalize="words"
                  leftIcon={<Ionicons name="person-outline" size={18} color={Colors.textSecondary} />}
                />
              )}
            />
            <Controller
              control={control} name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Почтаи электронӣ" value={value} onChangeText={onChange}
                  keyboardType="email-address" placeholder="email@example.com"
                  error={errors.email?.message}
                  leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />}
                />
              )}
            />
            <Controller
              control={control} name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Рамз" value={value} onChangeText={onChange}
                  placeholder="••••••••" isPassword error={errors.password?.message}
                  leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />}
                />
              )}
            />
            <Controller
              control={control} name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Рамзро тасдиқ кунед" value={value} onChangeText={onChange}
                  placeholder="••••••••" isPassword error={errors.confirmPassword?.message}
                  leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />}
                />
              )}
            />
          </View>

          <Button
            title={mutation.isPending ? 'Сохта шудан...' : 'Ба қайд гиред'}
            onPress={handleSubmit((d) => mutation.mutate(d))}
            loading={mutation.isPending}
            fullWidth
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Аккаунт доред? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchLink}>Ворид шавед</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  backBtn: { marginBottom: Spacing.lg, padding: 4, alignSelf: 'flex-start' },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xxl, borderWidth: 1, borderColor: Colors.border,
  },
  fields: { gap: Spacing.md },
  submitBtn: { marginTop: Spacing.xl, height: 50, borderRadius: Radius.md },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  switchText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  switchLink: { fontSize: FontSize.sm, color: Colors.brand, fontWeight: FontWeight.semibold },
})
