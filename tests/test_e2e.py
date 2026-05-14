"""E2E tests for the launcher lifecycle.

Tests requiring the patched Firefox binary are gated behind the
``firefox_binary`` fixture, which skips the test cleanly when the
binary is not cached locally and cannot be downloaded (e.g. no
network or no release token). The constructor-only tests (seed
handling) do not need a binary and always run.
"""
from __future__ import annotations

import sys

import pytest

from invisible_playwright import InvisiblePlaywright
from invisible_playwright.constants import BINARY_ENTRY_REL


@pytest.fixture(scope="session")
def firefox_binary():
    """Locate the patched Firefox binary or skip the calling test.

    We do NOT trigger a network download here: ``ensure_binary`` would
    pull a multi-hundred-megabyte archive from a private release,
    which is not appropriate inside a unit/E2E test run. Instead we
    look for an already-cached binary; if missing we skip.
    """
    if sys.platform not in BINARY_ENTRY_REL:
        pytest.skip(f"unsupported platform: {sys.platform}")
    from invisible_playwright.download import cache_dir_for_version
    entry = cache_dir_for_version() / BINARY_ENTRY_REL[sys.platform]
    if not entry.exists():
        pytest.skip(
            "patched Firefox binary not cached; run `invisible-playwright fetch` "
            "to enable E2E tests"
        )
    return str(entry)


# ────────────────────────────────────────────────────────────────────
# Constructor-only tests (no browser launch required)
# ────────────────────────────────────────────────────────────────────


@pytest.mark.e2e
def test_e3_seed_is_accessible():
    """E3: explicit seed is stored on the instance after construction."""
    ip = InvisiblePlaywright(seed=42)
    assert ip.seed == 42


@pytest.mark.e2e
def test_e4_random_seed_when_none():
    """E4: omitting seed → a fresh positive int31 is chosen."""
    ip = InvisiblePlaywright()
    assert isinstance(ip.seed, int)
    assert ip.seed > 0
    assert ip.seed < 2**31


@pytest.mark.e2e
def test_e4b_random_seed_varies_across_instances():
    """E4 extension: two no-seed instances pick different seeds with
    overwhelming probability. ``secrets.randbits(31)`` collisions are
    ~1 in 2 billion, so we accept the negligible flake risk."""
    seeds = {InvisiblePlaywright().seed for _ in range(5)}
    assert len(seeds) > 1


@pytest.mark.e2e
def test_e6_profile_built_eagerly():
    """The constructor materializes the Profile up front so seed-driven
    fields are accessible without launching a browser. Guards against
    a regression where Profile generation is deferred into ``__enter__``
    and an invalid pin therefore raises only at launch time.
    """
    ip = InvisiblePlaywright(seed=42)
    assert ip._profile is not None
    assert ip._profile.seed == 42


@pytest.mark.e2e
def test_e7_invalid_pin_raises_in_constructor():
    """Invalid pin keys fail fast at construction, not at __enter__."""
    with pytest.raises(ValueError):
        InvisiblePlaywright(seed=42, pin={"not_a_real_field": 1})


# ────────────────────────────────────────────────────────────────────
# Lifecycle tests (require Firefox binary)
# ────────────────────────────────────────────────────────────────────


@pytest.mark.e2e
def test_e1_sync_context_manager_lifecycle(firefox_binary):
    """E1: ``with InvisiblePlaywright(...) as browser`` yields a real
    Playwright Browser object that exposes ``new_context``."""
    with InvisiblePlaywright(seed=42, binary_path=firefox_binary) as browser:
        assert browser is not None
        assert hasattr(browser, "new_context")
        assert callable(browser.new_context)


@pytest.mark.e2e
def test_e2_create_context_and_page(firefox_binary):
    """E2: a context spawned from the patched browser can create a page."""
    with InvisiblePlaywright(seed=42, binary_path=firefox_binary) as browser:
        ctx = browser.new_context()
        try:
            page = ctx.new_page()
            assert page is not None
            assert hasattr(page, "goto")
        finally:
            ctx.close()


@pytest.mark.e2e
def test_e5_teardown_does_not_raise(firefox_binary):
    """E5: ``__exit__`` cleans up Playwright + virtual display without raising."""
    ip = InvisiblePlaywright(seed=42, binary_path=firefox_binary)
    browser = ip.__enter__()
    try:
        assert browser is not None
    finally:
        ip.__exit__(None, None, None)
    # second teardown is idempotent
    ip.__exit__(None, None, None)


@pytest.mark.e2e
def test_e8_new_context_defaults_from_profile(firefox_binary):
    """new_context() without kwargs should inherit profile-derived
    viewport/screen. Guards the monkey-patch installed in __enter__."""
    with InvisiblePlaywright(seed=42, binary_path=firefox_binary) as browser:
        ctx = browser.new_context()
        try:
            page = ctx.new_page()
            vp = page.viewport_size
            assert vp is not None
            assert vp["width"] > 0
            assert vp["height"] > 0
        finally:
            ctx.close()
