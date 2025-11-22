import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // If authenticated, redirect will be handled by _layout.tsx
  if (isAuthenticated) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>SCP Platform</Text>
        <Text style={styles.heroSubtitle}>
          Connecting suppliers and consumers for seamless business transactions
        </Text>

        <View style={styles.ctaButtons}>
          <Button
            onPress={() => router.push('/(auth)/register')}
            fullWidth
            style={styles.ctaButton}
          >
            Get Started
          </Button>
          <Button
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            fullWidth
            style={styles.ctaButton}
          >
            Sign In
          </Button>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.features}>
        <Text style={styles.sectionTitle}>How it works</Text>

        <View style={styles.featuresList}>
          <View style={styles.featureCard}>
            <View style={styles.featureNumber}>
              <Text style={styles.featureNumberText}>1</Text>
            </View>
            <Text style={styles.featureTitle}>Connect</Text>
            <Text style={styles.featureDescription}>
              Consumers find and request connections with trusted suppliers
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureNumber}>
              <Text style={styles.featureNumberText}>2</Text>
            </View>
            <Text style={styles.featureTitle}>Browse</Text>
            <Text style={styles.featureDescription}>
              View product catalogs, prices, and availability in real-time
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureNumber}>
              <Text style={styles.featureNumberText}>3</Text>
            </View>
            <Text style={styles.featureTitle}>Order</Text>
            <Text style={styles.featureDescription}>
              Place orders directly and track their status end-to-end
            </Text>
          </View>
        </View>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefits}>
        <Text style={styles.sectionTitle}>Why choose SCP?</Text>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>For Suppliers</Text>
              <Text style={styles.benefitText}>
                Manage products, staff, and orders from one dashboard
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>For Consumers</Text>
              <Text style={styles.benefitText}>
                Easy ordering, real-time updates, and direct communication
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Secure & Reliable</Text>
              <Text style={styles.benefitText}>
                Built with modern technology for secure business operations
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Staff Management</Text>
              <Text style={styles.benefitText}>
                Suppliers can add managers and sales staff with role-based access
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer CTA */}
      <View style={styles.footerCta}>
        <Text style={styles.footerTitle}>Ready to get started?</Text>
        <Text style={styles.footerSubtitle}>
          Join suppliers and consumers already using SCP Platform
        </Text>
        <Button
          onPress={() => router.push('/(auth)/register')}
          style={styles.footerButton}
        >
          Create Account
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flexGrow: 1,
  },

  // Hero Section
  hero: {
    alignItems: 'center',
    paddingVertical: spacing['6xl'],
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.xl,
  },
  heroTitle: {
    ...typography.h1,
    fontSize: 40,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    ...typography.bodyLarge,
    color: colors.foreground.secondary,
    textAlign: 'center',
    maxWidth: 500,
    marginBottom: spacing['3xl'],
  },
  ctaButtons: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
  },
  ctaButton: {
    marginBottom: 0,
  },

  // Features Section
  features: {
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background.secondary,
  },
  sectionTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  featuresList: {
    maxWidth: 900,
    alignSelf: 'center',
    gap: spacing.xl,
  },
  featureCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  featureNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.foreground.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  featureNumberText: {
    ...typography.h3,
    color: colors.foreground.inverse,
  },
  featureTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  featureDescription: {
    ...typography.body,
    color: colors.foreground.secondary,
    textAlign: 'center',
  },

  // Benefits Section
  benefits: {
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
  },
  benefitsList: {
    maxWidth: 600,
    alignSelf: 'center',
    gap: spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.foreground.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.foreground.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  benefitText: {
    ...typography.body,
    color: colors.foreground.secondary,
  },

  // Footer CTA
  footerCta: {
    alignItems: 'center',
    paddingVertical: spacing['6xl'],
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background.secondary,
  },
  footerTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  footerSubtitle: {
    ...typography.body,
    color: colors.foreground.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  footerButton: {
    minWidth: 200,
  },
});
