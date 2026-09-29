import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useLocale, useT } from "@/lib/i18n";
import { client } from "@/lib/api";
import { useOrg, useUpdateOrg } from "@/queries/orgs";
import {
  COMPANY_SIZES,
  COUNTRIES,
  INDUSTRIES,
  REFERRAL_SOURCES,
  countryName,
  optionLabel,
  orderedTimezones,
  timezoneLabel,
} from "@/constants/company-fields";

type Option = { value: string; label: string };

type Field =
  | "name"
  | "phone"
  | "email"
  | "address1"
  | "address2"
  | "city"
  | "state"
  | "postalCode"
  | "country"
  | "timezone"
  | "industry"
  | "companySize"
  | "referralSource";

type Form = Record<Field, string>;

const EMPTY: Form = {
  name: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  timezone: "",
  industry: "",
  companySize: "",
  referralSource: "",
};

/**
 * A select, phone-shaped: a row that reads the current choice and opens a searchable list.
 * The search box is not decoration — the country list is 256 long and the time zone list 418,
 * and scrolling to "Winnipeg" by thumb is not a thing anyone should have to do.
 */
function OptionRow({
  label,
  value,
  options,
  disabled,
  placeholder,
  searchLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  disabled: boolean;
  placeholder: string;
  searchLabel: string;
  onChange: (value: string) => void;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const current = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query]);

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
        {label.toUpperCase()}
      </Text>
      <Pressable
        accessibilityLabel={label}
        disabled={disabled}
        onPress={() => {
          setQuery("");
          setOpen(true);
        }}
        style={[
          styles.input,
          styles.selectRow,
          { borderColor: colors.border, opacity: disabled ? 0.6 : 1 },
        ]}
      >
        <Text
          style={[
            styles.selectText,
            { color: current ? colors.foreground : colors.mutedForeground },
          ]}
          numberOfLines={1}
        >
          {current?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={13} color={colors.mutedForeground} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={[styles.sheetTitle, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
            >
              {label.toUpperCase()}
            </Text>
            <View style={styles.sheetSearch}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchLabel}
                placeholderTextColor={colors.mutedForeground}
                accessibilityLabel={searchLabel}
                autoCorrect={false}
                style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              />
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Pressable
                onPress={() => {
                  onChange("");
                  setOpen(false);
                }}
                style={[styles.optionRow, { borderColor: colors.border }]}
              >
                <Text style={[styles.optionText, { color: colors.mutedForeground }]}>
                  {placeholder}
                </Text>
                {value ? null : <Ionicons name="checkmark" size={15} color={colors.amber} />}
              </Pressable>
              {filtered.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={[styles.optionRow, { borderColor: colors.border }]}
                >
                  <Text style={[styles.optionText, { color: colors.foreground }]}>
                    {option.label}
                  </Text>
                  {option.value === value ? (
                    <Ionicons name="checkmark" size={15} color={colors.amber} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/**
 * Teamspace settings: the workspace's own profile — legal name, where it invoices from, what
 * trade it is in, its logo. Reached from the workspace card at the top of the drawer, and
 * deliberately separate from the profile screen, which is the person rather than the business.
 *
 * Writes are owner-only, which is what `requireRole(role, "owner")` enforces on `orgs.update`;
 * everybody else gets this same screen with the inputs locked instead of a 403 on save.
 */
export default function TeamspaceSettings() {
  const colors = useColors();
  const router = useRouter();
  const tr = useT();
  const { locale } = useLocale();
  const org = useOrg();
  const updateOrg = useUpdateOrg();

  const [form, setForm] = useState<Form>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const record = org.data?.org;
  const isOwner = org.data?.role === "owner";
  const logo = record?.logoUrl ?? null;

  const countries = useMemo<Option[]>(
    () =>
      COUNTRIES.map((country) => ({
        value: country.code,
        label: countryName(country, locale),
      })).sort((a, b) => a.label.localeCompare(b.label, locale)),
    [locale],
  );
  const timezones = useMemo<Option[]>(
    () => orderedTimezones().map((zone) => ({ value: zone.id, label: timezoneLabel(zone) })),
    [],
  );
  const industries = useMemo<Option[]>(
    () => INDUSTRIES.map((key) => ({ value: key, label: optionLabel(key) })),
    [],
  );
  const sizes = useMemo<Option[]>(
    () => COMPANY_SIZES.map((size) => ({ value: size, label: size })),
    [],
  );
  const referrals = useMemo<Option[]>(
    () => REFERRAL_SOURCES.map((key) => ({ value: key, label: optionLabel(key) })),
    [],
  );

  // Seeded once, from the first response that carries the row. `orgs.current` refetches on
  // focus, so re-seeding on every fresh copy would overwrite whatever is half-typed.
  useEffect(() => {
    if (!record || loaded) return;
    setForm({
      name: record.name ?? "",
      phone: record.phone ?? "",
      email: record.email ?? "",
      address1: record.address1 ?? "",
      address2: record.address2 ?? "",
      city: record.city ?? "",
      state: record.state ?? "",
      postalCode: record.postalCode ?? "",
      country: record.country ?? "",
      timezone: record.timezone ?? "",
      industry: record.industry ?? "",
      companySize: record.companySize ?? "",
      referralSource: record.referralSource ?? "",
    });
    setLoaded(true);
  }, [record, loaded]);

  const set = (field: Field) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const flash = (message: string) => {
    setError(null);
    setNote(message);
    setTimeout(() => setNote(null), 4000);
  };

  const save = async () => {
    setError(null);
    const name = form.name.trim();
    if (name.length < 2) return;
    try {
      // Blank means "not set", so it goes to the column as null rather than as "": a field
      // someone cleared should read exactly like one nobody ever filled in.
      await updateOrg.mutateAsync({
        name,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address1: form.address1.trim() || null,
        address2: form.address2.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postalCode: form.postalCode.trim() || null,
        country: form.country || null,
        timezone: form.timezone || null,
        industry: form.industry || null,
        companySize: form.companySize || null,
        referralSource: form.referralSource || null,
      });
      flash(tr("org.settings.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  /**
   * The logo belongs to the workspace: it labels it in this drawer and in the browser's
   * sidebar, and a watermark template without one of its own stamps this. The column keeps
   * the bare storage key, never the presigned link.
   */
  const pickLogo = async () => {
    setError(null);
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
    const asset = picked.canceled ? null : picked.assets?.[0];
    if (!asset) return;
    setLogoBusy(true);
    try {
      const contentType = asset.mimeType ?? "image/png";
      const presigned = await client.upload.presignLogo({
        filename: asset.fileName ?? "logo.png",
        contentType,
      });
      const blob = await (await fetch(asset.uri)).blob();
      const put = await fetch(presigned.url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": contentType },
      });
      if (!put.ok) throw new Error(`Storage rejected the upload (${put.status})`);
      await updateOrg.mutateAsync({ logoUrl: presigned.key });
      flash(tr("org.settings.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLogoBusy(false);
    }
  };

  const removeLogo = async () => {
    setError(null);
    try {
      await updateOrg.mutateAsync({ logoUrl: null });
      flash(tr("org.settings.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const textField = (
    field: Field,
    label: string,
    extra?: { keyboardType?: "email-address" | "phone-pad"; required?: boolean },
  ) => (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
        {`${label.toUpperCase()}${extra?.required ? " *" : ""}`}
      </Text>
      <TextInput
        value={form[field]}
        onChangeText={set(field)}
        editable={isOwner}
        accessibilityLabel={label}
        keyboardType={extra?.keyboardType}
        autoCapitalize={extra?.keyboardType === "email-address" ? "none" : "sentences"}
        autoCorrect={false}
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.foreground, opacity: isOwner ? 1 : 0.6 },
        ]}
      />
    </View>
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityLabel={tr("common.close")}
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {tr("org.settings.title").toUpperCase()}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isOwner ? null : (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {tr("org.settings.ownerOnly")}
            </Text>
          </View>
        )}

        {/* Company logo */}
        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {tr("org.settings.brand").toUpperCase()}
        </Text>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.logoRow}>
            {logo ? (
              <Image
                source={{ uri: logo }}
                style={[styles.logoBox, { borderColor: colors.border }]}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.logoBox, { borderColor: colors.border }]}>
                <Ionicons name="business-outline" size={20} color={colors.mutedForeground} />
              </View>
            )}
            {isOwner ? (
              <>
                <Pressable
                  accessibilityLabel={tr("org.logo.upload")}
                  onPress={() => void pickLogo()}
                  disabled={logoBusy}
                  style={[styles.btn, { borderColor: colors.amber, opacity: logoBusy ? 0.6 : 1 }]}
                >
                  {logoBusy ? (
                    <ActivityIndicator color={colors.amber} size="small" />
                  ) : (
                    <Ionicons name="image-outline" size={15} color={colors.amber} />
                  )}
                  <Text style={[styles.btnText, { color: colors.amber }]}>
                    {tr("org.logo.upload")}
                  </Text>
                </Pressable>
                {logo ? (
                  <Pressable
                    accessibilityLabel={tr("common.delete")}
                    onPress={() => void removeLogo()}
                    style={[styles.btn, { borderColor: colors.border }]}
                  >
                    <Ionicons name="trash-outline" size={15} color={colors.mutedForeground} />
                    <Text style={[styles.btnText, { color: colors.mutedForeground }]}>
                      {tr("common.delete")}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
          </View>
        </View>

        {/* Company info */}
        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {tr("org.settings.companyInfo").toUpperCase()}
        </Text>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {textField("name", tr("org.field.companyName"), { required: true })}
        </View>

        {/* Contact */}
        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {tr("org.settings.contact").toUpperCase()}
        </Text>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {textField("phone", tr("org.field.phone"), { keyboardType: "phone-pad" })}
          {textField("email", tr("org.field.email"), { keyboardType: "email-address" })}
        </View>

        {/* Address */}
        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {tr("org.settings.address").toUpperCase()}
        </Text>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {textField("address1", tr("org.field.address1"))}
          {textField("address2", tr("org.field.address2"))}
          {textField("city", tr("org.field.city"))}
          {textField("state", tr("org.field.state"))}
          {textField("postalCode", tr("org.field.postalCode"))}
          <OptionRow
            label={tr("org.field.country")}
            value={form.country}
            options={countries}
            disabled={!isOwner}
            placeholder={tr("org.settings.select")}
            searchLabel={tr("org.settings.search")}
            onChange={set("country")}
          />
        </View>

        {/* About the business */}
        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {tr("org.settings.about").toUpperCase()}
        </Text>
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <OptionRow
            label={tr("org.field.timezone")}
            value={form.timezone}
            options={timezones}
            disabled={!isOwner}
            placeholder={tr("org.settings.select")}
            searchLabel={tr("org.settings.search")}
            onChange={set("timezone")}
          />
          <OptionRow
            label={tr("org.field.industry")}
            value={form.industry}
            options={industries}
            disabled={!isOwner}
            placeholder={tr("org.settings.select")}
            searchLabel={tr("org.settings.search")}
            onChange={set("industry")}
          />
          <OptionRow
            label={tr("org.field.companySize")}
            value={form.companySize}
            options={sizes}
            disabled={!isOwner}
            placeholder={tr("org.settings.select")}
            searchLabel={tr("org.settings.search")}
            onChange={set("companySize")}
          />
          <OptionRow
            label={tr("org.field.referral")}
            value={form.referralSource}
            options={referrals}
            disabled={!isOwner}
            placeholder={tr("org.settings.select")}
            searchLabel={tr("org.settings.search")}
            onChange={set("referralSource")}
          />
        </View>

        {error ? <Text style={[styles.note, { color: colors.alert }]}>{error}</Text> : null}
        {note ? <Text style={[styles.note, { color: colors.verified }]}>{note}</Text> : null}

        {isOwner ? (
          <Pressable
            accessibilityLabel={tr("profile.saveChanges")}
            onPress={() => void save()}
            disabled={updateOrg.isPending || form.name.trim().length < 2}
            style={[
              styles.primary,
              {
                backgroundColor: colors.amber,
                opacity: updateOrg.isPending || form.name.trim().length < 2 ? 0.5 : 1,
              },
            ]}
          >
            {updateOrg.isPending ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Ionicons name="save-outline" size={16} color={colors.background} />
            )}
            <Text style={[styles.primaryText, { color: colors.background }]}>
              {tr("profile.saveChanges")}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 12 : 6,
    paddingBottom: 10,
  },
  topTitle: { fontSize: 14, letterSpacing: 3 },
  topSpacer: { width: 22 },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  card: { borderWidth: 1, padding: 14, gap: 12, borderRadius: 12 },
  section: { fontSize: 10, letterSpacing: 2, marginTop: 8 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 10, letterSpacing: 1.6 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    borderRadius: 8,
  },
  selectRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  selectText: { fontSize: 13, flex: 1 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnText: { fontSize: 12 },
  logoRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sheet: { borderWidth: 1, maxHeight: "72%", borderRadius: 12, overflow: "hidden" },
  sheetTitle: { fontSize: 10, letterSpacing: 2, paddingHorizontal: 12, paddingTop: 12 },
  sheetSearch: { paddingHorizontal: 12, paddingVertical: 10 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  optionText: { fontSize: 12.5, flex: 1 },
  meta: { fontSize: 11.5, lineHeight: 17 },
  note: { fontSize: 12, textAlign: "center", marginTop: 8, lineHeight: 18 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryText: { fontSize: 13, fontWeight: "700" },
});
