import { rupiah, rupiahSingkat, terbilang, parseRupiah } from '@ghifari29/id-kit/format';
import { parseNIK } from '@ghifari29/id-kit/nik';
import { maskNIK } from '@ghifari29/id-kit/mask';
import { normalizePhone, detectOperator } from '@ghifari29/id-kit/phone';
import { cekLibur, hitungHariKerja } from '@ghifari29/id-kit/libur';
import { cariWilayah } from '@ghifari29/id-kit/wilayah';

/**
 * Safely evaluates Rupiah formatting, terbilang, compact notation, and Rupiah string parsing.
 */
export const evaluateFormatSample = (rawNumberInput = '1250000', rawRupiahText = 'Rp1.250.000,-') => {
  const trimmedNum = String(rawNumberInput ?? '').trim();
  const parsedNum = trimmedNum === '' ? NaN : Number(trimmedNum);

  let formattedRupiah = null;
  let shortRupiah = null;
  let terbilangText = null;
  let formatError = null;

  if (!Number.isFinite(parsedNum)) {
    formatError = 'Masukkan angka valid.';
  } else {
    try {
      formattedRupiah = rupiah(parsedNum);
      shortRupiah = rupiahSingkat(parsedNum);
      if (Number.isSafeInteger(parsedNum)) {
        terbilangText = terbilang(parsedNum);
      } else {
        terbilangText = '(terbilang memerlukan bilangan bulat aman)';
      }
    } catch (err) {
      formatError = err?.message || 'Input angka di luar batas yang didukung.';
    }
  }

  let parsedRupiah = null;
  let parseError = null;
  try {
    parsedRupiah = parseRupiah(String(rawRupiahText ?? ''));
  } catch (err) {
    parseError = err?.message || 'Format string Rupiah tidak valid.';
  }

  return {
    numberValid: formatError === null,
    numericValue: Number.isFinite(parsedNum) ? parsedNum : null,
    formattedRupiah,
    shortRupiah,
    terbilangText,
    formatError,
    parsedRupiah,
    parseError,
  };
};

/**
 * Safely parses and masks a fictional 16-digit Indonesian NIK.
 */
export const evaluateNikSample = (nikInput = '3171011505900001') => {
  const value = String(nikInput ?? '');
  try {
    return {
      parsed: parseNIK(value),
      masked: maskNIK(value),
      error: null,
    };
  } catch (err) {
    return {
      parsed: null,
      masked: '',
      error: err?.message || 'Input NIK tidak valid.',
    };
  }
};

/**
 * Safely normalizes an Indonesian mobile number and detects its original carrier prefix.
 */
export const evaluatePhoneSample = (phoneInput = '0812-3456-789') => {
  const value = String(phoneInput ?? '');
  try {
    return {
      normalized: normalizePhone(value),
      operatorResult: detectOperator(value),
      error: null,
    };
  } catch (err) {
    return {
      normalized: null,
      operatorResult: null,
      error: err?.message || 'Input nomor tidak valid.',
    };
  }
};

/**
 * Safely checks a single date against SKB 3 Menteri holidays and counts working days across a date range.
 */
export const evaluateLiburSample = (
  startDate = '2026-08-14',
  endDate = '2026-08-18',
  checkDate = '2026-08-17',
  options = {}
) => {
  let liburResult = null;
  let liburError = null;
  try {
    liburResult = cekLibur(String(checkDate ?? ''));
  } catch (err) {
    liburError = err?.message || 'Format tanggal harus YYYY-MM-DD.';
  }

  let hariKerjaResult = null;
  let hariKerjaError = null;
  try {
    hariKerjaResult = hitungHariKerja(String(startDate ?? ''), String(endDate ?? ''), {
      sabtuKerja: Boolean(options.sabtuKerja),
      sertakanCutiBersama: options.sertakanCutiBersama !== false,
    });
  } catch (err) {
    hariKerjaError = err?.message || 'Rentang tanggal harus valid (YYYY-MM-DD).';
  }

  return {
    liburResult,
    liburError,
    hariKerjaResult,
    hariKerjaError,
  };
};

/**
 * Safely searches Indonesian provinces and regencies/cities by name fragment.
 */
export const evaluateWilayahSample = (query = 'sorong', batas = 20) => {
  try {
    const results = cariWilayah(String(query ?? ''), { batas });
    return {
      results,
      error: null,
    };
  } catch (err) {
    return {
      results: [],
      error: err?.message || 'Kata kunci pencarian tidak valid.',
    };
  }
};
