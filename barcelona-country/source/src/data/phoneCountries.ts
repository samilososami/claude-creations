export type PhoneCountry = {
  name: string;
  dial: string;
  iso: string;
};

export const phoneCountries: PhoneCountry[] = [
  { name: 'España', dial: '+34', iso: 'ES' },
  { name: 'Alemania', dial: '+49', iso: 'DE' },
  { name: 'Andorra', dial: '+376', iso: 'AD' },
  { name: 'Argentina', dial: '+54', iso: 'AR' },
  { name: 'Bélgica', dial: '+32', iso: 'BE' },
  { name: 'Brasil', dial: '+55', iso: 'BR' },
  { name: 'Canadá', dial: '+1', iso: 'CA' },
  { name: 'Chile', dial: '+56', iso: 'CL' },
  { name: 'Colombia', dial: '+57', iso: 'CO' },
  { name: 'Estados Unidos', dial: '+1', iso: 'US' },
  { name: 'Francia', dial: '+33', iso: 'FR' },
  { name: 'Irlanda', dial: '+353', iso: 'IE' },
  { name: 'Italia', dial: '+39', iso: 'IT' },
  { name: 'México', dial: '+52', iso: 'MX' },
  { name: 'Países Bajos', dial: '+31', iso: 'NL' },
  { name: 'Portugal', dial: '+351', iso: 'PT' },
  { name: 'Reino Unido', dial: '+44', iso: 'GB' },
  { name: 'Suiza', dial: '+41', iso: 'CH' },
  { name: 'Uruguay', dial: '+598', iso: 'UY' }
];

export const countryFlag = (iso: string) =>
  String.fromCodePoint(...iso.toUpperCase().split('').map((letter) => 127397 + letter.charCodeAt(0)));
