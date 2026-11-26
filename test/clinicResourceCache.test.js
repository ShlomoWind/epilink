import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClinicResourceKey,
  clearResourceCache,
  loadResource,
  invalidateResource,
  getResourceSnapshot,
} from '../src/utils/resourceCache.js';

test('clinic resource keys include clinic and user identities', () => {
  assert.equal(
    buildClinicResourceKey('appointments', 'clinic-a', 'user-1'),
    'appointments:clinic-a:user-1',
  );
  assert.notEqual(
    buildClinicResourceKey('appointments', 'clinic-a', 'user-1'),
    buildClinicResourceKey('appointments', 'clinic-b', 'user-1'),
  );
});

test('switching clinics cannot reuse another clinic snapshot', async () => {
  clearResourceCache();

  const clinicAKey = buildClinicResourceKey(
    'clients',
    'clinic-a',
    'user-1',
  );
  const clinicBKey = buildClinicResourceKey(
    'clients',
    'clinic-b',
    'user-1',
  );

  await loadResource(clinicAKey, async () => ['client-a'], 60_000);
  await loadResource(clinicBKey, async () => ['client-b'], 60_000);

  assert.deepEqual(getResourceSnapshot(clinicAKey).data, ['client-a']);
  assert.deepEqual(getResourceSnapshot(clinicBKey).data, ['client-b']);

  invalidateResource(clinicAKey);
  assert.equal(getResourceSnapshot(clinicAKey).updatedAt, 0);
  assert.deepEqual(getResourceSnapshot(clinicBKey).data, ['client-b']);

  clearResourceCache();
  assert.equal(getResourceSnapshot(clinicAKey).data, undefined);
  assert.equal(getResourceSnapshot(clinicBKey).data, undefined);
});
