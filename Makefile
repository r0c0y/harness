.PHONY: setup run serve probe test clean

setup:
	@node --version
	@echo "Harness has no runtime package dependencies."

run:
	@node src/main.js

serve:
	@node src/main.js --serve

probe:
	@node src/main.js --probe

test:
	@node --test

clean:
	@rm -rf .ai-harness
